import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { styled, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import discordTheme from "./Theme";
import { useNavigate,useLocation } from "react-router-dom"; // 메인 홈페이지로 이동을 위해 useNavigate 사용
import { useCurrentMember } from "../hooks/useCurrentMember";

const VideoContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: theme.spacing(2),
  "& video": {
    width: "300px",
    height: "200px",
    borderRadius: theme.shape.borderRadius,
  },
  "& .session-id": {
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
  },
}));

const VoiceChannel = forwardRef(({ channel, channelId }, ref) => {
  const location = useLocation();
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const socketRef = useRef(null);
  const iceCandidatesBufferRef = useRef({});
  const sessionIdRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [isOfferer, setIsOfferer] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { currentMember, currentUserMutate, isLoading } = useCurrentMember(); // 현재 사용자 정보 가져오기
  const [usernameMap, setUsernameMap] = useState({});
  const usernameMapRef = useRef({}); // useRef로 usernameMap 생성
  const myName = useRef(null);

  const sessionMapRef = useRef({});
  const nextSessionNumberRef = useRef(1);

  useImperativeHandle(ref, () => ({
    handleLeave,
  }));

  const call = useCallback(async () => {
    console.log("Call function called");
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "join",
          source: sessionIdRef.current,
          target: "all",
          username : myName.current,
          channelId, // 메시지에 channelId 포함
        })
      );
      console.log("Join sent:", myName);
    }
  }, [channelId]);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        setIsStreamReady(true);
        console.log("Local stream obtained");
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    getUserMedia();
    connectWebSocket();

    // 사용자가 페이지를 떠나거나 브라우저를 닫을 때 처리
    const handleBeforeUnload = (event) => {
      handleLeave();  // handleLeave 함수 호출
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [channelId]); // channelId가 변경될 때마다 새로 설정

  useEffect(() => {
    console.log("Session ID updated:", sessionId);
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const initiateCall = async () => {
      await currentUserMutate(); // currentMember를 최신 상태로 갱신
      if (isConnected && sessionId && isStreamReady && currentMember) {
        console.log("hello! name = " + currentMember);
        console.log("All conditions met, ready to start signaling...");
        if (isOfferer) {
          console.log("Starting call as offerer...");
          myName.current = currentMember;
          call();
        }
      }
    };

    initiateCall();
  }, [isConnected, sessionId, isStreamReady, isOfferer, call, currentMember]);

  const connectWebSocket = () => {
    const newSocket = new WebSocket(`ws://localhost:8080/socket?channelId=${channelId}`); // channelId 포함

    newSocket.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnected(true);
      setIsOfferer(true);
    };

    newSocket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      console.log("Message received:", data);
      if (data.type === "offer") {
        setIsOfferer(false);
        await handleOffer(data);
      } else if (data.type === "answer") {
        await handleAnswer(data);
      } else if (data.type === "candidate") {
        await handleCandidate(data);
      } else if (data.type === "setSessionId") {
        setSessionId(data.sessionId);
        console.log("Session ID set:", data.sessionId);
      } else if (data.type === "join") {
        await handleJoin(data);
      } else if (data.type === "leave") {
        handleRemoteLeave(data);
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed, attempting to reconnect");
      setIsConnected(false);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current = newSocket;
  };

  const getSessionNumber = (sourceId) => {
    console.log("Getting session number for:", sourceId);
    if (!sessionMapRef.current[sourceId]) {
      const newSessionNumber = nextSessionNumberRef.current;
      sessionMapRef.current[sourceId] = newSessionNumber;
      nextSessionNumberRef.current += 1;
      return newSessionNumber;
    }
    console.log("Session number:", sessionMapRef.current[sourceId]);
    return sessionMapRef.current[sourceId];
  };

  const handleJoin = async (data) => {
    console.log("Handling join:", data);
    const sourceId = data.source;
    setUsernameMap((prev) => {
      const updatedMap = { ...prev, [sourceId]: data.username };
      usernameMapRef.current = updatedMap; // useRef로 업데이트
      return updatedMap;
    });
    const newPeerConnection = await createPeerConnection(
      getSessionNumber(sourceId),
      sourceId
    );

    if (newPeerConnection) {
      const offer = await peerConnectionsRef.current[
        getSessionNumber(sourceId)
      ].createOffer();
      await peerConnectionsRef.current[
        getSessionNumber(sourceId)
      ].setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "offer",
            sdp: offer.sdp,
            source: sessionIdRef.current,
            target: sourceId,
            username: myName.current,
            channelId, // 메시지에 channelId 포함
          })
        );
        console.log("Offer sent to ", sourceId);
      }
    } else {
      console.log("Peer connection not found");
    }
  };

  const handleOffer = async (data) => {
    console.log("Handling offer:", data);
    setUsernameMap((prev) => {
      const updatedMap = { ...prev, [data.source]: data.username };
      usernameMapRef.current = updatedMap; // useRef로 업데이트
      return updatedMap;
    });
    const sessionNumber = getSessionNumber(data.source);
    const newPeerConnection = await createPeerConnection(
      sessionNumber,
      data.source
    );

    if (newPeerConnection) {
      console.log("Setting remote description for offer:", data);
      try {
        await peerConnectionsRef.current[sessionNumber].setRemoteDescription(
          new RTCSessionDescription(data)
        );
        const answer = await peerConnectionsRef.current[
          sessionNumber
        ].createAnswer();
        await peerConnectionsRef.current[sessionNumber].setLocalDescription(
          answer
        );

        if (socketRef.current) {
          socketRef.current.send(
            JSON.stringify({
              type: "answer",
              sdp: answer.sdp,
              source: sessionIdRef.current,
              target: data.source,
              username: myName.current, // 현재 사용자 이름 포함
              channelId, // 메시지에 channelId 포함
            })
          );
          console.log("Answer sent:", answer.sdp);
        }

        iceCandidatesBufferRef.current[sessionNumber].forEach((candidate) => {
          peerConnectionsRef.current[sessionNumber].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        });
        iceCandidatesBufferRef.current[sessionNumber] = [];
      } catch (error) {
        console.error("Error setting remote description for offer:", error);
      }
    }
  };

  const handleAnswer = async (data) => {
    console.log("Handling answer:", data);
    const sessionNumber = getSessionNumber(data.source);
    setUsernameMap((prev) => {
      const updatedMap = { ...prev, [data.source]: data.username };
      usernameMapRef.current = updatedMap; // useRef로 업데이트
      return updatedMap;
    });
    if (peerConnectionsRef.current[sessionNumber]) {
      if (
        peerConnectionsRef.current[sessionNumber].signalingState !==
        "have-local-offer"
      ) {
        console.warn(
          "Peer connection is not in have-local-offer state:",
          peerConnectionsRef.current[sessionNumber].signalingState
        );
        return;
      }

      console.log("Setting remote description for answer:", data);
      try {
        await peerConnectionsRef.current[sessionNumber].setRemoteDescription(
          new RTCSessionDescription(data)
        );
      } catch (error) {
        console.error("Error setting remote description for answer:", error);
      }
    }
  };

  const handleCandidate = async (data) => {
    const candidate = new RTCIceCandidate(data.candidate);
    const sessionNumber = getSessionNumber(data.source);
    if (
      peerConnectionsRef.current[sessionNumber] &&
      peerConnectionsRef.current[sessionNumber].remoteDescription
    ) {
      console.log("Adding ICE candidate:", candidate);
      await peerConnectionsRef.current[sessionNumber].addIceCandidate(candidate);
    } else {
      console.log("Buffering ICE candidate:", candidate);
      if (!iceCandidatesBufferRef.current[sessionNumber]) {
        iceCandidatesBufferRef.current[sessionNumber] = [];
      }
      iceCandidatesBufferRef.current[sessionNumber].push(candidate);
    }
  };

  const createPeerConnection = async (sessionNumber, sourceId) => {
    console.log("Creating peer connection");
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("ICE candidate:", event.candidate);
        socketRef.current.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            source: sessionIdRef.current,
            target: sourceId,
            channelId, // 메시지에 channelId 포함
          })
        );
        console.log("ICE candidate sent to", sourceId);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event);
      if (!remoteVideoRefs.current[sessionNumber]) {
        const videoElement = document.createElement("video");
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.srcObject = event.streams[0];

        const videoContainer = document.createElement("div");
        videoContainer.style.position = "relative";

        const sessionIdElement = document.createElement("div");
        sessionIdElement.className = "session-id";
        sessionIdElement.innerText = usernameMapRef.current[sourceId]; // useRef로부터 가져오기

        console.log("source Id = " + sourceId);
        console.log("name : " + usernameMapRef.current[sourceId]);

        videoContainer.appendChild(videoElement);
        videoContainer.appendChild(sessionIdElement);
        document.getElementById("video-grid").appendChild(videoContainer);

        remoteVideoRefs.current[sessionNumber] = videoElement;
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
        console.log("Track added to peer connection:", track);
      });
    }

    peerConnectionsRef.current[sessionNumber] = peerConnection;
    return peerConnection;
  };

  const handleLeave = () => {
    return new Promise((resolve) => {
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "leave",
            source: sessionIdRef.current,
            target: "all",
            channelId,
          })
        );
        socketRef.current.close();
      }

      // 모든 피어 연결 끊기
      Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
        peerConnection.close();
      });

      // 모든 비디오 요소 제거
      Object.values(remoteVideoRefs.current).forEach((videoElement) => {
        const sessionIdElement = videoElement.parentNode.querySelector('.session-id');
        if (videoElement.parentNode) {
          if (sessionIdElement) {
            sessionIdElement.parentNode.removeChild(sessionIdElement);
          }
          videoElement.parentNode.removeChild(videoElement);
        }
      });

      // 로컬 비디오 요소 제거
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        localVideoRef.current.srcObject = null;
      }

      peerConnectionsRef.current = {};
      remoteVideoRefs.current = {};
      iceCandidatesBufferRef.current = {};
      usernameMapRef.current = {};

      resolve();
    });
  };

  const handleRemoteLeave = (data) => {
    const sessionNumber = getSessionNumber(data.source);
    console.log("Handling remote leave for session number:", sessionNumber);

    if (peerConnectionsRef.current[sessionNumber]) {
      console.log("Closing peer connection for session number:", sessionNumber);
      peerConnectionsRef.current[sessionNumber].close();
      delete peerConnectionsRef.current[sessionNumber];
    }

    if (remoteVideoRefs.current[sessionNumber]) {
      const videoElement = remoteVideoRefs.current[sessionNumber];
      const sessionIdElement = videoElement.parentNode.querySelector('.session-id');
      console.log("Removing video element for session number:", sessionNumber);
      if (videoElement.parentNode) {
        if (sessionIdElement) {
          sessionIdElement.parentNode.removeChild(sessionIdElement);
        }
        videoElement.parentNode.removeChild(videoElement);
      }
      delete remoteVideoRefs.current[sessionNumber];
    }

    if (iceCandidatesBufferRef.current[sessionNumber]) {
      delete iceCandidatesBufferRef.current[sessionNumber];
    }
  };

  return (
    <ThemeProvider theme={discordTheme}>
      <CssBaseline />
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {channel}
          </Typography>
          <VideoContainer id="video-grid">
            {currentMember ? (
              <>
                <div style={{ position: "relative" }}>
                  <video ref={localVideoRef} autoPlay playsInline muted />
                  <div className="session-id">{currentMember} (나)</div>
                </div>
              </>
            ) : (
              <Typography variant="h6" component="p" color="error">
                로그인 후 이용해 주세요
              </Typography>
            )}
          </VideoContainer>
        </Box>
      </Container>
    </ThemeProvider>
  );
  
});

export default VoiceChannel;

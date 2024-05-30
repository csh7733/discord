import React, { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const VideoChatting = ({ userId, channelId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(new RTCPeerConnection());
  const stompClient = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [remoteStream, setRemoteStream] = useState(null);
  const [iceCandidatesQueue, setIceCandidatesQueue] = useState([]);

  const handleIceCandidate = useCallback(
    (event) => {
      console.log("handleIceCandidate called", event);
      if (event.candidate) {
        console.log("ICE 후보 전송", event.candidate);
        stompClient.current.send(
          `/app/channel/${channelId}/ice-candidate`,
          {},
          JSON.stringify({
            type: "CANDIDATE",
            candidate: event.candidate,
            origin: userId,
            channelId,
          })
        );
      } else {
        console.log("ICE 후보 탐색 완료");
      }
    },
    [channelId, userId]
  );

  const handleTrack = useCallback((event) => {
    console.log("원격 스트림 수신", event.streams[0]);
    setRemoteStream(event.streams[0]);
  }, []);

  const handleIceConnectionStateChange = useCallback(() => {
    console.log("ICE Connection State Change:", pc.current.iceConnectionState);
    if (pc.current.iceConnectionState === "connected") {
      console.log("ICE Connection Established");
    }
  }, []);


  useEffect(() => {
    // PeerConnection 초기화 및 이벤트 리스너 추가
    const setupPeerConnection = () => {
      if (pc.current) {
        pc.current.close();
      }

      pc.current = new RTCPeerConnection();

      pc.current.onicecandidate = handleIceCandidate;
      pc.current.ontrack = handleTrack;
      pc.current.oniceconnectionstatechange = handleIceConnectionStateChange;

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log("로컬 스트림 설정", stream);
          localVideoRef.current.srcObject = stream;
          stream
            .getTracks()
            .forEach((track) => pc.current.addTrack(track, stream));
        })
        .catch((error) => console.error("미디어 장치 접근 에러.", error));
    };

    setupPeerConnection();

    return () => {
      if (pc.current) {
        pc.current.close();
      }
    };
  }, [
    channelId,
    handleIceCandidate,
    handleTrack,
    handleIceConnectionStateChange,
  ]);

  useEffect(() => {
    if (remoteStream) {
      console.log("원격 스트림 설정", remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    // 웹소켓 연결 초기화
    const setupWebSocket = () => {
      const socket = new SockJS("http://localhost:8080/ws");
      stompClient.current = Stomp.over(socket);

      stompClient.current.connect({}, () => {
        console.log("Connected to WebSocket");
        stompClient.current.subscribe(
          `/topic/channel/${channelId}`,
          onMessageReceived
        );
        console.log(`Subscribed to /channel/${channelId}`);

        const joinMessage = {
          type: "JOIN",
          userId: userId,
          channelId: channelId,
        };
        stompClient.current.send(
          `/app/channel/${channelId}/join`,
          {},
          JSON.stringify(joinMessage)
        );
        console.log("Sent join message", joinMessage);
      });
    };

    setupWebSocket();

    return () => {
      const leaveMessage = {
        type: "LEAVE",
        userId: userId,
        channelId: channelId,
      };
      if (stompClient.current) {
        stompClient.current.send(
          `/app/channel/${channelId}/leave`,
          {},
          JSON.stringify(leaveMessage)
        );
        console.log("Sent leave message", leaveMessage);
        stompClient.current.disconnect();
        console.log("Disconnected from WebSocket");
      }
    };
  }, [channelId, userId]);

  const onMessageReceived = (message) => {
    console.log("Received message:", message.body);
    const data = JSON.parse(message.body);

    if (data.userId !== userId) {
      if (data.sdp) {
        console.log("SDP 메시지 수신", data.sdp);
        handleRemoteDescription(data.sdp);
      } else if (data.candidate) { // 조건 수정: data.origin !== userId 조건 제거
        console.log("ICE 후보 수신", data.candidate);
        handleRemoteCandidate(data.candidate);
      }
    }

    if (data.type === "JOIN" || data.type === "LEAVE") {
      setConnectedUsers(data.connectedUsers);
      if (data.type === "JOIN" && data.userId !== userId) {
        createOffer(data.userId);
      }
    }
  };

  const createOffer = async (targetUserId) => {
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    console.log("SDP 오퍼 생성", offer);
    const sdpMessage = {
      type: "SDP",
      sdp: pc.current.localDescription,
      userId: userId,
      targetUserId: targetUserId,
      channelId: channelId,
    };
    stompClient.current.send(
      `/app/channel/${channelId}/sdp`,
      {},
      JSON.stringify(sdpMessage)
    );
    console.log("SDP 오퍼 전송", sdpMessage);
  };

  const handleRemoteDescription = async (sdp) => {
    const desc = new RTCSessionDescription(sdp);
    await pc.current.setRemoteDescription(desc);
    console.log("원격 SDP 설정", desc);

    if (desc.type === "offer") {
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      console.log("SDP 응답 생성", answer);
      const sdpMessage = {
        type: "SDP",
        sdp: pc.current.localDescription,
        userId: userId,
        channelId: channelId,
      };
      stompClient.current.send(
        `/app/channel/${channelId}/sdp`,
        {},
        JSON.stringify(sdpMessage)
      );
      console.log("SDP 응답 전송", sdpMessage);
    }

    // 임시 저장된 ICE 후보 추가
    console.log("임시 저장된 ICE 후보 추가 시도");
    iceCandidatesQueue.forEach(async (candidate) => {
      try {
        await pc.current.addIceCandidate(candidate);
        console.log("임시 저장된 ICE 후보 추가 성공", candidate);
      } catch (error) {
        console.error("임시 저장된 ICE 후보 추가 에러", error);
      }
    });
    setIceCandidatesQueue([]); // 후보 추가 후 큐 초기화
  };

  const handleRemoteCandidate = async (candidate) => {
    console.log("리모트 ICE 후보 추가 시도", candidate);

    if (pc.current.remoteDescription) {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("리모트 ICE 후보 추가 성공");
      } catch (error) {
        console.error("리모트 ICE 후보 추가 에러", error);
      }
    } else {
      console.log("원격 설명이 설정되지 않아 ICE 후보를 임시 저장", candidate);
      setIceCandidatesQueue((prev) => [
        ...prev,
        new RTCIceCandidate(candidate),
      ]);
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        음성 채널 {channelId}
      </Typography>
      <Box display="flex" justifyContent="center" mb={4}>
        <Box position="relative" mr={2}>
          <video ref={localVideoRef} autoPlay muted style={styles.video} />
          <Typography
            variant="caption"
            style={styles.remoteUserLabel}
            component="div"
          >
            나
          </Typography>
        </Box>
        <Box position="relative">
          <video ref={remoteVideoRef} autoPlay style={styles.video} />
          <Typography
            variant="caption"
            style={styles.remoteUserLabel}
            component="div"
          >
            상대방
          </Typography>
        </Box>
      </Box>
      <Paper style={styles.userListPaper}>
        <Typography variant="h6" align="center" gutterBottom>
          사용자 목록
        </Typography>
        <List>
          {connectedUsers.map((user) => (
            <ListItem key={user}>
              <ListItemText primary={user === userId ? `${user} (나)` : user} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

const styles = {
  video: {
    width: "400px",
    height: "300px",
    backgroundColor: "black",
  },
  remoteUserLabel: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "2px 4px",
    borderRadius: "4px",
  },
  userListPaper: {
    padding: "16px",
  },
};

export default VideoChatting;

import React, { useRef, useEffect, useState, useCallback } from "react";

function MultiTest() {
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

  // UseRef for sessionMap and nextSessionNumber
  const sessionMapRef = useRef({});
  const nextSessionNumberRef = useRef(1);

  const call = useCallback(async () => {
    console.log("Call function called");

    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "join",
          source: sessionIdRef.current,
          target: "all",
        })
      );
      console.log("Join sent:");
    }
  }, []);

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

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    console.log("Session ID updated:", sessionId);
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (isConnected && sessionId && isStreamReady) {
      console.log("All conditions met, ready to start signaling...");
      if (isOfferer) {
        console.log("Starting call as offerer...");
        call();
      }
    }
  }, [isConnected, sessionId, isStreamReady, isOfferer, call]);

  const connectWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:8080/socket");

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
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed, attempting to reconnect");
      setIsConnected(false);
      //setTimeout(connectWebSocket, 2000);
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
      await peerConnectionsRef.current[sessionNumber].addIceCandidate(
        candidate
      );
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
          })
        );
        console.log("ICE candidate sent to", sourceId);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event);
      if (!remoteVideoRefs.current[sessionNumber]) {
        remoteVideoRefs.current[sessionNumber] =
          document.createElement("video");
        remoteVideoRefs.current[sessionNumber].autoplay = true;
        remoteVideoRefs.current[sessionNumber].playsInline = true;
        document.body.appendChild(remoteVideoRefs.current[sessionNumber]);
      }
      remoteVideoRefs.current[sessionNumber].srcObject = event.streams[0];
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

  return (
    <div>
      <h1>WebRTC Video Chat</h1>
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted />
      </div>
    </div>
  );
}

export default MultiTest;

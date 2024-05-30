import React, { useRef, useEffect, useState } from 'react';

function Test() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const iceCandidatesBuffer = useRef([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [isOfferer, setIsOfferer] = useState(false);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        setIsStreamReady(true);
        console.log('Local stream obtained');
      } catch (error) {
        console.error('Error accessing media devices.', error);
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
    if (isConnected && sessionId && isStreamReady) {
      console.log('All conditions met, ready to start signaling...');
      if (isOfferer) {
        console.log('Starting call as offerer...');
        call();
      }
    }
  }, [isConnected, sessionId, isStreamReady]);

  const connectWebSocket = () => {
    const newSocket = new WebSocket('ws://localhost:8080/socket');

    newSocket.onopen = () => {
      console.log('WebSocket connection opened');
      setIsConnected(true);
      setIsOfferer(true); // 연결이 열리면 이 클라이언트가 offerer가 됨
    };

    newSocket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      console.log('Message received:', data);
      if (data.type === 'offer') {
        setIsOfferer(false); // offer를 받으면 answerer가 됨
        await handleOffer(data);
      } else if (data.type === 'answer') {
        await handleAnswer(data);
      } else if (data.type === 'candidate') {
        await handleCandidate(data);
      } else if (data.type === 'setSessionId') {
        setSessionId(data.sessionId);
        console.log('Session ID set:', data.sessionId);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed, attempting to reconnect');
      setIsConnected(false);
      setTimeout(connectWebSocket, 2000); // 2초 후에 재시도
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current = newSocket;
  };

  const handleOffer = async (data) => {
    if (peerConnectionRef.current) {
      console.log('Handling offer:', data);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'answer',
          sdp: answer.sdp,
          target: data.source
        }));
        console.log('Answer sent:', answer.sdp);
      }

      // Add buffered ICE candidates
      iceCandidatesBuffer.current.forEach(candidate => {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
      iceCandidatesBuffer.current = [];
    }
  };

  const handleAnswer = async (data) => {
    if (peerConnectionRef.current) {
      console.log('Handling answer:', data);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
    }
  };

  const handleCandidate = async (data) => {
    const candidate = new RTCIceCandidate(data.candidate);
    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
      console.log('Adding ICE candidate:', candidate);
      await peerConnectionRef.current.addIceCandidate(candidate);
    } else {
      console.log('Buffering ICE candidate:', candidate);
      iceCandidatesBuffer.current.push(candidate);
    }
  };

  const createPeerConnection = () => {
    console.log('Creating peer connection');
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log('ICE candidate:', event.candidate);
        socketRef.current.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          target: 'all'
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Remote track received:', event);
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
        console.log('Track added to peer connection:', track);
      });
    }

    peerConnectionRef.current = peerConnection;
  };

  const call = async () => {
    console.log('Call function called');
    createPeerConnection();

    if (peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'offer',
          sdp: offer.sdp,
          target: 'all'
        }));
        console.log('Offer sent:', offer.sdp);
      }
    }
  };

  return (
    <div>
      <h1>WebRTC Video Chat</h1>
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
}

export default Test;

import React, { useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const VideoChat = ({ userId, channelId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const peerConnections = useRef({});
  const stompClient = useRef(null);
  const [connectedMembers, setConnectedMembers] = useState([]);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const serverUrl = "http://localhost:8080/ws";
    const sock = new SockJS(serverUrl);
    stompClient.current = Stomp.over(sock);
    stompClient.current.connect({}, onConnected, onError);

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const onConnected = () => {
    stompClient.current.subscribe(
      `/topic/voice-channel/${channelId}/members`,
      onMemberUpdate
    );
    stompClient.current.subscribe(
      `/topic/voice-channel/${channelId}/offer`,
      onMessageReceived
    );
    stompClient.current.subscribe(
      `/topic/voice-channel/${channelId}/answer`,
      onMessageReceived
    );
    stompClient.current.subscribe(
      `/topic/voice-channel/${channelId}/candidate`,
      onMessageReceived
    );
    sendMessage({ type: "join", from: userId });
  };

  const onError = (error) => {
    console.error("Error connecting to WebSocket:", error);
  };

  const onMessageReceived = (message) => {
    console.log("Received message:", message.body);
    const signalMessage = JSON.parse(message.body);
    const { from, to, type, sdp, candidate } = signalMessage;

    if (from === userId) return;

    if (type === "offer" && to[0] === userId) {
      handleOffer(from, sdp);
    } else if (type === "answer" && to[0] === userId) {
      handleAnswer(from, sdp);
    } else if (type === "candidate" && to[0] === userId) {
      handleCandidate(from, candidate);
    }
  };

  const onMemberUpdate = (message) => {
    console.log("Received member update:", message.body);
    const newMember = JSON.parse(message.body);
    const exist = connectedMembers.find((member) => member.id === newMember.id);
    if (exist) return;
    setConnectedMembers((prevMembers) => [...prevMembers, newMember]);
    connectToMember(newMember);
  };

  const sendMessage = (message) => {
    stompClient.current.send(
      `/app/voice-channel/${channelId}/${message.type}`,
      {},
      JSON.stringify(message)
    );
  };

  const startCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        setStream(stream);
        setConnectedMembers((prev) => [...prev, userId]);
        stream.getTracks().forEach((track) => {
          Object.values(peerConnections.current).forEach((pc) =>
            pc.addTrack(track, stream)
          );
        });
      });
  };

  const stopCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      localVideoRef.current.srcObject = null;
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
    }
    setConnectedMembers([]);
    sendMessage({ type: "leave", from: userId });
  };

  const handleOffer = (from, sdp) => {
    console.log(`Received offer from ${from}`);
    console.log("Offer SDP:", sdp.sdp);
    const pc = createPeerConnection(from);
    const remoteDescription = new RTCSessionDescription({
      type: "offer",
      sdp: sdp.sdp,
    });
    pc.setRemoteDescription(remoteDescription)
      .then(() => {
        pc.createAnswer().then((answer) => {
          pc.setLocalDescription(answer);
          sendMessage({
            type: "answer",
            sdp: answer,
            from: userId,
            to: [from],
          });
        });
      })
      .catch((error) => {
        console.error(`Error setting remote description for ${from}:`, error);
      });
  };

  const handleAnswer = (from, sdp) => {
    const pc = peerConnections.current[from];
    if (pc) {
      const remoteDescription = new RTCSessionDescription({
        type: "answer",
        sdp: sdp.sdp,
      });
      pc.setRemoteDescription(remoteDescription).catch((error) => {
        console.error(`Error setting remote description for ${from}:`, error);
      });
    } else {
      console.error(`PeerConnection not found for ${from}`);
    }
  };

  const handleCandidate = (from, candidate) => {
    const pc = peerConnections.current[from];
    if (!pc) {
      createPeerConnection(from);
    }
    if (pc) {
      if (pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log(`Added ICE candidate for ${from}`))
          .catch((e) =>
            console.error(`Error adding ICE candidate for ${from}:`, e)
          );
      } else {
        if (!pc.queuedCandidates) {
          pc.queuedCandidates = [];
        }
        pc.queuedCandidates.push(candidate);
      }
    } else {
      console.error(`Failed to create peer connection for ${from}`);
    }
  };

  const createPeerConnection = (memberId) => {
    const pc = new RTCPeerConnection();
    peerConnections.current[memberId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: "candidate",
          candidate: event.candidate,
          from: userId,
          to: [memberId],
        });
      }
    };

    pc.ontrack = (event) => {
      if (!remoteVideoRefs.current[memberId]) {
        remoteVideoRefs.current[memberId] = React.createRef();
      }
      setTimeout(() => {
        if (remoteVideoRefs.current[memberId].current) {
          remoteVideoRefs.current[memberId].current.srcObject =
            event.streams[0];
        } else {
          console.error(`No video element found for member ${memberId}`);
        }
      }, 0);
    };

    return pc;
  };

  const connectToMember = (memberId) => {
    const pc = createPeerConnection(memberId);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          console.log(`Sending offer to ${memberId}`);
          sendMessage({
            type: "offer",
            sdp: offer,
            from: userId,
            to: [memberId],
          });
        });
      });
  };

  return (
    <div>
      <div>
        <h3> 채널 {channelId}</h3>
        <h3>Connected Members</h3>
        <ul>
          {connectedMembers.map((memberId) => (
            <li key={memberId}>{memberId}</li>
          ))}
        </ul>
      </div>
      <video ref={localVideoRef} autoPlay playsInline muted></video>
      {connectedMembers.map((memberId) => (
        <video
          key={`${channelId}-${memberId}`} // 고유한 키 생성
          ref={remoteVideoRefs.current[memberId]}
          autoPlay
          playsInline
        ></video>
      ))}
      <button onClick={startCall}>Start Call</button>
      <button onClick={stopCall}>Stop Call</button>
    </div>
  );
};

export default VideoChat;

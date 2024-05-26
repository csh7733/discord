import React, { useRef, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const VideoStream = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    // Function to initialize and connect STOMP client
    const connectClient = (stream) => {
      const socket = new SockJS("http://localhost:8080/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log(str),
        onDisconnect: () => {
          console.log("Disconnected from WebSocket");
        },
        reconnectDelay: 5000, // Reconnect after 5 seconds
      });

      client.onConnect = () => {
        console.log("Connected to WebSocket");
        client.subscribe("/topic/video", (message) => {
          const blob = new Blob([message.binaryBody], { type: "video/webm" });
          remoteVideoRef.current.src = URL.createObjectURL(blob);
        });

        // Send video stream
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            client.publish({
              destination: "/app/video",
              binaryBody: event.data,
            });
          }
        };
        recorder.start(100); // Send data every 100ms
        setMediaRecorder(recorder);
      };

      client.activate();
      setStompClient(client);
    };

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        connectClient(stream);
      })
      .catch((error) => console.error("Error accessing media devices.", error));

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, []);

  return (
    <div>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={{ width: "300px", height: "200px" }}
      ></video>
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ width: "300px", height: "200px" }}
      ></video>
    </div>
  );
};

export default VideoStream;

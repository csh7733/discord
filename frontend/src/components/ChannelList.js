// channelList.js
import React, { useEffect, useState, useRef } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import ChatChannel from "./Chat";
import VoiceChannel from "./Voice";
import { mainListItems, secondaryListItems } from "./listItems";

const socketUrl = "http://localhost:8080/ws";

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const chatChannelIdRef = useRef(3);
  const voiceChannelIdRef = useRef(3);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS(socketUrl);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/channels", (message) => {
        const updatedChannels = JSON.parse(message.body);
        const chatChannels = updatedChannels.filter(
          (channel) => channel.type === "chat"
        );
        const voiceChannels = updatedChannels.filter(
          (channel) => channel.type === "voice"
        );
        setChannels(chatChannels);
        setVoiceChannels(voiceChannels);
      });

      stompClient.send("/app/channels", {}, {});
      setStompClient(stompClient);
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

  const handleAddChatChannel = () => {
    const newChannelId = chatChannelIdRef.current;
    chatChannelIdRef.current += 1; // 다음에 사용할 ID 증가
    const newChannel = {
      id: newChannelId,
      key: `chat${newChannelId}`,
      name: `채팅 채널 ${newChannelId}`,
      messages: [],
      type: "chat",
    };

    // 서버로 채널 추가 요청
    stompClient.send("/app/addChannel", {}, JSON.stringify(newChannel));
  };

  const handleAddVoiceChannel = () => {
    const newChannelId = voiceChannelIdRef.current;
    voiceChannelIdRef.current += 1; // 다음에 사용할 ID 증가
    const newChannel = {
      id: newChannelId,
      key: `voice${newChannelId}`,
      name: `음성 채널 ${newChannelId}`,
      type: "voice",
    };

    // 서버로 채널 추가 요청
    stompClient.send("/app/addChannel", {}, JSON.stringify(newChannel));
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4, display: "flex", flexGrow: 1 }}
    >
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid item xs={3}>
          <List component="nav">
            {mainListItems(channels, handleChannelSelect, handleAddChatChannel)}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems(
              voiceChannels,
              handleChannelSelect,
              handleAddVoiceChannel
            )}
          </List>
        </Grid>
        <Grid item xs={9} sx={{ height: "100%" }}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {selectedChannel && selectedChannel.type === "chat" && (
              <ChatChannel
                channel={selectedChannel.name}
                channelId={selectedChannel.id}
              />
            )}
            {selectedChannel && selectedChannel.type === "voice" && (
              <VoiceChannel channelId={selectedChannel.id} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChannelList;

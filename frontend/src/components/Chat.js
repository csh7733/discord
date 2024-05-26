import React, { useState, useRef, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@mui/material";
import discordTheme from "./Theme";
import avatar3 from "../assets/avatar/3.png"; // 최성현의 아바타를 기본값으로 불러오기
import { useCurrentMember } from "../hooks/useCurrentMember";

const ChatChannel = ({ channel, initialMessages }) => {
  const { currentMember } = useCurrentMember();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages); // 선택된 채널이 변경될 때 초기 메시지를 설정
  }, [channel, initialMessages]);

  const handleSendMessage = () => {
    const message = {
      user: currentMember ? undefined : "anonymous",
      content: newMessage,
      avatar: avatar3, // 최성현의 아바타 사용
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ThemeProvider theme={discordTheme}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        width="100%"
        border="1px solid #202225"
        borderRadius="8px"
        bgcolor="background.paper"
      >
        <Typography variant="h6" color="inherit" noWrap sx={{ p: 2 }}>
          {channel}
        </Typography>
        <Box flexGrow={1} overflow="auto" p={2}>
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                alignItems="flex-start"
                style={{ marginBottom: "16px" }} // 메시지 간의 간격을 16px로 설정
              >
                <ListItemAvatar>
                  <Avatar alt="User Avatar" src={message.avatar} />
                </ListItemAvatar>
                <Box display="flex" flexDirection="column" ml={2}>
                  <Typography
                    variant="body1"
                    style={{
                      fontWeight: "bold",
                      color: discordTheme.palette.text.primary,
                    }}
                  >
                    {message.user}{" "}
                    <span
                      style={{
                        fontWeight: "normal",
                        color: discordTheme.palette.text.secondary,
                        marginLeft: "8px",
                      }}
                    >
                      {message.time}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ color: discordTheme.palette.text.primary }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        <Box display="flex" p={1} borderTop="1px solid #202225">
          <TextField
            fullWidth
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress} // 엔터 키 이벤트 핸들러 추가
            placeholder="메시지를 입력하세요..."
            size="small"
            InputProps={{
              style: { background: "#40444B", color: "#FFFFFF" },
            }}
            style={{ marginRight: "8px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            size="small"
          >
            전송
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ChatChannel;

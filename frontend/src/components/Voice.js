import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, Typography, Avatar } from "@mui/material";
import { useCurrentMember } from "../hooks/useCurrentMember";
import apiClient from "../apiClient";

const VoiceChannel = ({ channelId }) => {
  const { currentMember } = useCurrentMember();
  const [members, setmembers] = useState([]);

  useEffect(() => {
    const fetchmembers = async () => {
      try {
        const response = await apiClient.get(
          `http://localhost:8080/api/voice-channel/${channelId}/members`
        );
        const data = response.data;
        setmembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchmembers();
  }, [channelId]);

  const startVideoChat = (userId) => {
    // Logic to start video chat with the given user ID
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Voice Channel: {channelId}
      </Typography>
      <Grid container spacing={2}>
        {members.map((user) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={2}
              border={1}
              borderRadius={2}
              borderColor="grey.300"
            >
              <Avatar
                src={`https://i.pravatar.cc/150?u=${user.id}`}
                alt={user.name}
                sx={{ width: 100, height: 100, mb: 1 }}
              />
              <Typography>{user.name}</Typography>
              <video
                ref={(videoRef) => startVideoChat(user.id, videoRef)}
                width="100%"
                autoPlay
                muted
                style={{ marginTop: "1em" }}
              ></video>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VoiceChannel;

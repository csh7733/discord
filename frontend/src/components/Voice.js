import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Avatar } from "@mui/material";
import { useCurrentMember } from "../hooks/useCurrentMember";

const getRandomUser = () => {
  const randomId = Math.floor(Math.random() * 1000);
  return { id: randomId, name: `User ${randomId}` };
};

const VoiceChannel = ({ channelId }) => {
  const { currentMember } = useCurrentMember();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers([{ id: Math.floor(Math.random() * 1000), name: currentMember }]);

    const intervalId = setInterval(() => {
      const newUser = getRandomUser();
      console.log("user added:", newUser);
      setUsers((prevUsers) => [...prevUsers, newUser]);
    }, 5000); // 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [channelId, currentMember]);

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Voice Channel: {channelId}
      </Typography>
      <Grid container spacing={2}>
        {users.map((user) => (
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
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VoiceChannel;

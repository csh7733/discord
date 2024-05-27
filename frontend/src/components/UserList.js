import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Skeleton,
} from "@mui/material";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const avatars = [
  "../assets/avatar/1.png",
  "../assets/avatar/2.png",
  "../assets/avatar/3.png",
];

const UserList = forwardRef((props, ref) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe("/topic/users", (message) => {
          const userNames = JSON.parse(message.body);
          const usersWithDetails = userNames.map((name, index) => ({
            id: index + 1,
            name,
            avatar: avatars[index % avatars.length], // Cycle through avatars
          }));
          setUsers(usersWithDetails);
          setLoading(false); // Set loading to false after data is fetched
        });

        client.publish({ destination: "/app/users" });
      },
      onStompError: (frame) => {
        console.error(`Broker reported error: ${frame.headers["message"]}`);
        console.error(`Additional details: ${frame.body}`);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    handleAddUser: (userName) => {
      const client = new Client({
        webSocketFactory: () => new SockJS("/ws"),
      });

      client.onConnect = () => {
        client.publish({ destination: "/app/addUser", body: userName });
      };

      client.activate();
    },

    handleRemoveUser: (userName) => {
      const client = new Client({
        webSocketFactory: () => new SockJS("/ws"),
      });

      client.onConnect = () => {
        client.publish({ destination: "/app/removeUser", body: userName });
      };

      client.activate();
    },
  }));

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color: "text.secondary" }}>
        온라인
      </Typography>
      {loading ? (
        <List>
          {Array.from(new Array(5)).map((_, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton width="80%" />}
                secondary={<Skeleton width="40%" />}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar src={user.avatar} />
              </ListItemAvatar>
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
});

export default UserList;

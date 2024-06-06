import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
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
  const clientRef = useRef(null); // 클라이언트를 useRef로 관리
  const [connected, setConnected] = useState(false); // WebSocket 연결 상태 추가
  const taskQueue = useRef([]); // 작업 대기열

  useEffect(() => {
    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true); // WebSocket 연결 완료 시 상태 업데이트
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

        // WebSocket 연결이 완료된 후 대기열의 작업을 처리
        taskQueue.current.forEach(task => task());
        taskQueue.current = []; // 작업을 모두 처리한 후 대기열 초기화

        client.publish({ destination: "/app/users" });
      },
      onStompError: (frame) => {
        console.error(`Broker reported error: ${frame.headers["message"]}`);
        console.error(`Additional details: ${frame.body}`);
      },
    });

    client.activate();
    clientRef.current = client; // 클라이언트를 ref에 저장

    return () => {
      client.deactivate();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    handleAddUser: (userName) => {
      const task = () => {
        if (clientRef.current && clientRef.current.connected) {
          clientRef.current.publish({ destination: "/app/addUser", body: userName });
        }
      };

      if (connected) {
        task();
      } else {
        taskQueue.current.push(task); // 연결되지 않았으면 대기열에 추가
      }
    },

    handleRemoveUser: (userName) => {
      const task = () => {
        if (clientRef.current && clientRef.current.connected) {
          clientRef.current.publish({ destination: "/app/removeUser", body: userName });
        }
      };

      if (connected) {
        task();
      } else {
        taskQueue.current.push(task); // 연결되지 않았으면 대기열에 추가
      }
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

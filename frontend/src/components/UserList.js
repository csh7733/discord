import React from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import avatar1 from '../assets/avatar/1.png';
import avatar2 from '../assets/avatar/2.png';
import avatar3 from '../assets/avatar/3.png';

const users = [
  { id: 1, name: '최성현', avatar: avatar3 },
  { id: 2, name: '박지원', avatar: avatar1 },
  { id: 3, name: '류지승', avatar: avatar2 },
];

const UserList = () => {
  return (
    <Box sx={{ p: 1  }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
        온라인
      </Typography>
      <List>
        {users.map(user => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar src={user.avatar} />
            </ListItemAvatar>
            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UserList;

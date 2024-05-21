import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, TextField, Button, List, ListItem, ListItemAvatar, Avatar, Typography } from '@mui/material';
import discordTheme from './Theme';

const ChatChannel = () => {
    const [messages, setMessages] = useState([
        { user: 'User1', content: 'Hello!', avatar: '/images/avatar/1.jpg', time: '6:39 PM' },
        { user: 'User2', content: 'Hi there!', avatar: '/images/avatar/2.jpg', time: '6:40 PM' },
        { user: 'You', content: 'This is my message.', avatar: '/images/avatar/3.jpg', time: '6:41 PM' },
        { user: 'User1', content: 'More messages to show the scroll functionality.', avatar: '/images/avatar/1.jpg', time: '6:42 PM' },
        { user: 'User2', content: 'Let us add more messages.', avatar: '/images/avatar/2.jpg', time: '6:43 PM' },
        { user: 'You', content: 'Scrolling is important in chat applications.', avatar: '/images/avatar/3.jpg', time: '6:44 PM' },
        { user: 'User1', content: 'We can add as many messages as needed.', avatar: '/images/avatar/1.jpg', time: '6:45 PM' },
        { user: 'User2', content: 'This is another message to test scrolling.', avatar: '/images/avatar/2.jpg', time: '6:46 PM' },
        { user: 'You', content: 'Let us keep adding more messages.', avatar: '/images/avatar/3.jpg', time: '6:47 PM' },
        { user: 'User1', content: 'Here is yet another message.', avatar: '/images/avatar/1.jpg', time: '6:48 PM' },
        { user: 'User2', content: 'Keep going with more messages Keep going with more messages Keep going with more messages Keep going with more messages Keep going with more messages Keep going with more messages.', avatar: '/images/avatar/2.jpg', time: '6:49 PM' },
        { user: 'You', content: 'Just a few more to be sure.', avatar: '/images/avatar/3.jpg', time: '6:50 PM' },
        { user: 'User1', content: 'Almost there, testing scrolling.', avatar: '/images/avatar/1.jpg', time: '6:51 PM' },
        { user: 'User2', content: 'Last few messages to ensure scrolling works.', avatar: '/images/avatar/2.jpg', time: '6:52 PM' },
        { user: 'You', content: 'This should be enough to test scrolling.', avatar: '/images/avatar/3.jpg', time: '6:53 PM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        const message = {
            user: 'You',
            content: newMessage,
            avatar: '/images/avatar/3.jpg',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, message]);
        setNewMessage('');
    };

    return (
        <ThemeProvider theme={discordTheme}>
            <Box display="flex" flexDirection="column" height="800px" width="600px" border="1px solid #202225" borderRadius="8px" bgcolor="background.paper">
                <Box flexGrow={1} overflow="auto" p={2}>
                    <List>
                        {messages.map((message, index) => (
                        <ListItem 
                            key={index} 
                            alignItems="flex-start" 
                            style={{ marginBottom: '16px' }} // 메시지 간의 간격을 16px로 설정
                        >
                            <ListItemAvatar>
                                <Avatar alt="User Avatar" src={message.avatar} />
                            </ListItemAvatar>
                            <Box display="flex" flexDirection="column" ml={2}>
                                <Typography variant="body1" style={{ fontWeight: 'bold', color: discordTheme.palette.text.primary }}>
                                    {message.user} <span style={{ fontWeight: 'normal', color: discordTheme.palette.text.secondary, marginLeft: '8px' }}>{message.time}</span>
                                </Typography>
                                <Typography variant="body2" style={{ color: discordTheme.palette.text.primary }}>
                                    {message.content}
                                </Typography>
                            </Box>
                        </ListItem>
                        
                        ))}
                    </List>
                </Box>
                <Box display="flex" p={1} borderTop="1px solid #202225">
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        size="small"
                        InputProps={{
                            style: { background: '#40444B', color: '#FFFFFF' }
                        }}
                        style={{ marginRight: '8px' }}
                    />
                    <Button variant="contained" color="primary" onClick={handleSendMessage} size="small">
                        Send
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ChatChannel;

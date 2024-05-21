import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';

export const mainListItems = (handleChannelSelect, handleAddChannel) => (
  <React.Fragment>
    <ListSubheader component="div" inset>
      채팅 채널
    </ListSubheader>
    {['채팅 채널 1', '채팅 채널 2'].map((text, index) => (
      <ListItemButton key={text} onClick={() => handleChannelSelect(text)}>
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    ))}
    <ListItemButton onClick={handleAddChannel}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary="+ 채팅 채널 추가" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (handleChannelSelect, handleAddVoiceChannel) => (
  <React.Fragment>
    <ListSubheader component="div" inset>
      음성 채널
    </ListSubheader>
    {['음성 채널 1', '음성 채널 2'].map((text, index) => (
      <ListItemButton key={text} onClick={() => handleChannelSelect(text)}>
        <ListItemIcon>
          <MicIcon />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    ))}
    <ListItemButton onClick={handleAddVoiceChannel}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary="+ 음성 채널 추가" />
    </ListItemButton>
  </React.Fragment>
);

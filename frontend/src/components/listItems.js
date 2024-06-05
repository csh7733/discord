import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText"; // 경로 수정
import ListSubheader from "@mui/material/ListSubheader";
import ChatIcon from "@mui/icons-material/Chat";
import MicIcon from "@mui/icons-material/Mic";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export const mainListItems = (
  channels,
  handleChannelSelect,
  handleAddChannel,
  handleContextMenu
) => (
  <React.Fragment>
    <ListSubheader component="div" inset>
      채팅 채널
    </ListSubheader>
    {channels.map((channel) => (
      <ListItemButton
        key={channel.key}
        onClick={() => handleChannelSelect(channel)}
      >
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={channel.name} />
        <IconButton
          edge="end"
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={(event) => {
            event.stopPropagation(); // 이벤트 전파 막기
            handleContextMenu(event, channel);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemButton>
    ))}
    <ListItemButton onClick={handleAddChannel}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary="채팅 채널 추가" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (
  voiceChannels,
  handleChannelSelect,
  handleAddVoiceChannel,
  handleContextMenu
) => (
  <React.Fragment>
    <ListSubheader component="div" inset>
      음성 채널
    </ListSubheader>
    {voiceChannels.map((channel) => (
      <ListItemButton
        key={channel.key}
        onClick={() => handleChannelSelect(channel)}
      >
        <ListItemIcon>
          <MicIcon />
        </ListItemIcon>
        <ListItemText primary={channel.name} />
        <IconButton
          edge="end"
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={(event) => {
            event.stopPropagation(); // 이벤트 전파 막기
            handleContextMenu(event, channel);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemButton>
    ))}
    <ListItemButton onClick={handleAddVoiceChannel}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary="음성 채널 추가" />
    </ListItemButton>
  </React.Fragment>
);

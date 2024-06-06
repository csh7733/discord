import React, { useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import ChatIcon from "@mui/icons-material/Chat";
import MicIcon from "@mui/icons-material/Mic";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useCurrentMember } from "../hooks/useCurrentMember"; // 훅 임포트
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button } from "@mui/material";

const NotificationModal = ({ open, handleClose }) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogContent>
      <Typography variant="h6" component="h2">
        Please log in and use it
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

export const MainListItems = (channels,handleChannelSelect, handleAddChannel, handleContextMenu ) => {
  const { currentMember, isLoading } = useCurrentMember(); // 현재 멤버 가져오기
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleAddChannelClick = () => {
    if (!currentMember && !isLoading) {
      handleModalOpen();
    } else {
      handleAddChannel();
    }
  };

  const handleContextMenuClick = (event, channel) => {
    if (!currentMember && !isLoading) {
      handleModalOpen();
    } else {
      handleContextMenu(event, channel);
    }
  };

  return (
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
              handleContextMenuClick(event, channel);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemButton>
      ))}
      <ListItemButton onClick={handleAddChannelClick}>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="채팅 채널 추가" />
      </ListItemButton>
      <NotificationModal open={modalOpen} handleClose={handleModalClose} />
    </React.Fragment>
  );
};

export const SecondaryListItems = ( voiceChannels, handleChannelSelect, handleAddVoiceChannel, handleContextMenu ) => {
  const { currentMember, isLoading } = useCurrentMember(); // 현재 멤버 가져오기
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleAddVoiceChannelClick = () => {
    if (!currentMember && !isLoading) {
      handleModalOpen();
    } else {
      handleAddVoiceChannel();
    }
  };

  const handleContextMenuClick = (event, channel) => {
    if (!currentMember && !isLoading) {
      handleModalOpen();
    } else {
      handleContextMenu(event, channel);
    }
  };

  return (
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
              handleContextMenuClick(event, channel);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemButton>
      ))}
      <ListItemButton onClick={handleAddVoiceChannelClick}>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="음성 채널 추가" />
      </ListItemButton>
      <NotificationModal open={modalOpen} handleClose={handleModalClose} />
    </React.Fragment>
  );
};

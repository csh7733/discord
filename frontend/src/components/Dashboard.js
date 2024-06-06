import * as React from "react";
import { useRef, useState } from "react";
import { styled, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import MicIcon from "@mui/icons-material/Mic";
import ListItemButton from "@mui/material/ListItemButton";
import ChangePassword from "./ChangePassword";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { mainListItems, secondaryListItems } from "./listItems";
import ChatChannel from "./Chat";
import UserList from "./UserList";
import discordTheme from "./Theme";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import DialogActions from "@mui/material/DialogActions";
import Login from "./Login";
import SignUp from "./SignUp";
import FindPassword from "./FindPassword"; // FindPassword 추가
import Title from "../assets/title.png";
import TitleText from "../assets/title-text.png";
import avatar1 from "../assets/avatar/1.png";
import avatar2 from "../assets/avatar/2.png";
import avatar3 from "../assets/avatar/3.png";
import VoiceChannel from "./Voice";
import { useCurrentMember } from "../hooks/useCurrentMember";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChannelList from "./ChannelList";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiClient from "../apiClient";
import { useLocation } from "react-router-dom";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"네트워크 프로토콜 © "}
      <Link color="inherit" href="https://mui.com/">
        최성현 박지원 류지승
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: drawerWidth,
  width: `calc(100% - ${drawerWidth}px)`,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    boxSizing: "border-box",
  },
}));

export default function Dashboard() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [findPasswordOpen, setFindPasswordOpen] = useState(false); // 비밀번호 찾기 모달 상태 추가
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuted = localStorage.getItem("isMuted");
    return savedMuted ? JSON.parse(savedMuted) : false;
  });

  const [isVideoOff, setIsVideoOff] = useState(() => {
    const savedVideoOff = localStorage.getItem("isVideoOff");
    return savedVideoOff ? JSON.parse(savedVideoOff) : false;
  });
  const voiceChannelRef = useRef();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const channelId = params.get("channelId");
    const voiceChannelName = params.get("channelName");
    const channelType = params.get("channelType");

    if (channelId && voiceChannelName) {
      setSelectedChannel({
        id: channelId,
        name: voiceChannelName,
        type: channelType,
      }); // Adjust this based on your channel type
    }
  }, [location]);

  const [stompClient, setStompClient] = useState(null);

  React.useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/channels", (message) => {
        const updatedChannels = JSON.parse(message.body);

        const chatChannels = updatedChannels
          .filter((channel) => channel.type === "chat")
          .sort((a, b) => (a.id > b.id ? 1 : -1));

        const voiceChannels = updatedChannels
          .filter((channel) => channel.type === "voice")
          .sort((a, b) => (a.id > b.id ? 1 : -1));
        setChannels(chatChannels);
        setVoiceChannels(voiceChannels);
      });

      stompClient.send("/app/channels", {}, {});
      setStompClient(stompClient);
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);

  const [selectedChannel, setSelectedChannel] = useState(null); // 현재 선택된 채널을 관리하는 상태
  const { currentMember, isLoading, error, currentUserMutate } =
    useCurrentMember(); // useCurrentMember 훅 사용
  const [channels, setChannels] = useState([]); // 채널 목록을 관리하는 상태
  const [voiceChannels, setVoiceChannels] = useState([]); // 음성 채널 목록을 관리하는 상태
  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 추가된 상태
  const [contextMenu, setContextMenu] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState(null);
  const [channelName, setChannelName] = useState("");

  const userListRef = useRef();

  React.useEffect(() => {
    setSnackbarOpen(true);
  }, []);

  const handleLoginOpen = () => {
    setLoginOpen(true);
    setSignUpOpen(false);
    setFindPasswordOpen(false); // 비밀번호 찾기 모달 닫기
    setChangePasswordOpen(false);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleSignUpOpen = () => {
    setSignUpOpen(true);
    setLoginOpen(false);
    setFindPasswordOpen(false); // 비밀번호 찾기 모달 닫기
  };

  const handleSignUpClose = () => {
    setSignUpOpen(false);
  };

  const handleFindPasswordOpen = () => {
    setFindPasswordOpen(true);
    setLoginOpen(false);
    setSignUpOpen(false);
  };

  const handleFindPasswordClose = () => {
    setFindPasswordOpen(false);
  };

  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true);
    handleMenuClose(); // 현재 메뉴 닫기
  };

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
  };

  const handleDeleteAccountOpen = () => {
    setDeleteAccountOpen(true);
    handleMenuClose(); // 현재 메뉴 닫기
  };

  const handleDeleteAccountClose = () => {
    setDeleteAccountOpen(false);
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      await apiClient.delete("/users/me", {});
      // 계정 삭제 후 로그아웃 처리
      handleLogout();
    } catch (error) {
      console.error("Account deletion failed", error);
      setDeleteAccountOpen(false);
    }
  };

  const handleChannelSelect = (channel) => {
    if (
      selectedChannel &&
      selectedChannel.type === "voice" &&
      voiceChannelRef.current
    ) {
      setTimeout(() => {
        window.location.href = `/?channelId=${channel.id}&channelName=${channel.name}&channelType=${channel.type}`;
      }, 20); // 20ms 대기 후 새로고침 및 이동
    } else {
      setSelectedChannel(channel);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // 로컬 스토리지에서 토큰 삭제
    const username = currentMember;
    localStorage.removeItem("token");

    // SWR의 캐시에서 currentMember 삭제
    currentUserMutate(null, false);
    handleMenuClose();

    // Remove user from the UserList
    if (userListRef.current) {
      userListRef.current.handleRemoveUser(username);
    }

    // 현재 URL로 새로고침
    window.location.href = window.location.href;
  };

  const handleLogin = async () => {
    const name = await currentUserMutate();

    handleLoginClose();

    // Add user to the UserList
    if (userListRef.current) {
      userListRef.current.handleAddUser(name);
    }
  };

  const isMenuOpen = Boolean(anchorEl);
  const menuId = "primary-search-account-menu";

  const handleAddChatChannel = () => {
    const newChannelId =
      channels.length > 0 ? channels[channels.length - 1].id + 1 : 1;
    const newChannel = {
      id: newChannelId,
      key: `chat${newChannelId}`, // 채팅 채널 ID를 고유하게 변경
      name: `채팅 채널 ${newChannelId}`,
      messages: [],
      type: "chat",
    };

    stompClient.send("/app/addChannel", {}, JSON.stringify(newChannel));
    setChannels([...channels, newChannel]);
  };

  const handleAddVoiceChannel = () => {
    const newChannelId =
      voiceChannels.length > 0
        ? voiceChannels[voiceChannels.length - 1].id + 1
        : 1;

    const newChannel = {
      id: newChannelId,
      key: `voice${newChannelId}`, // 음성 채널 ID를 고유하게 변경
      name: `음성 채널 ${newChannelId}`,
      type: "voice",
    };

    stompClient.send("/app/addChannel", {}, JSON.stringify(newChannel));
    setVoiceChannels([...voiceChannels, newChannel]);
  };

  // 추가된 함수들
  const handleContextMenu = (event, channel) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            channel,
          }
        : null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleEditChannel = () => {
    setChannelName(contextMenu.channel.name);
    setChannelToEdit(contextMenu.channel);
    setEditDialogOpen(true);
    handleContextMenuClose();
  };

  const handleDeleteChannel = () => {
    stompClient.send("/app/removeChannel", {}, contextMenu.channel.key);
    if (contextMenu.channel.type === "chat") {
      const newChannels = channels.filter(
        (channel) => channel.id !== contextMenu.channel.id
      );
      setChannels(newChannels);
    } else {
      const newVoiceChannels = voiceChannels.filter(
        (channel) => channel.id !== contextMenu.channel.id
      );
      setVoiceChannels(newVoiceChannels);
    }
    handleContextMenuClose();
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleChannelNameChange = (event) => {
    setChannelName(event.target.value);
  };

  const handleChannelNameSave = () => {
    stompClient.send(
      "/app/updateChannel",
      {},
      JSON.stringify({ ...channelToEdit, name: channelName })
    );
    if (channelToEdit.type === "chat") {
      const newChannels = channels.map((channel) =>
        channel.id === channelToEdit.id
          ? { ...channel, name: channelName }
          : channel
      );
      setChannels(newChannels);
    } else {
      const newVoiceChannels = voiceChannels.map((channel) =>
        channel.id === channelToEdit.id
          ? { ...channel, name: channelName }
          : channel
      );
      setVoiceChannels(newVoiceChannels);
    }
    setEditDialogOpen(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      localStorage.setItem("isMuted", !prev);
      return !prev;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff((prev) => {
      localStorage.setItem("isVideoOff", !prev);
      return !prev;
    });
  };

  return (
    <ThemeProvider theme={discordTheme}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />
        <AppBar position="absolute">
          <Toolbar sx={{ pr: "24px" }}>
            <img
              src={Title}
              alt="Title"
              style={{ height: "50px", width: "50px" }}
            />
            <img
              src={TitleText}
              alt="Discord"
              style={{ height: "40px", marginLeft: "10px" }}
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
            {!currentMember ? (
              <>
                <Button
                  onClick={handleLoginOpen}
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  Log In
                </Button>
                <Button
                  onClick={handleSignUpOpen}
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Typography color="inherit" sx={{ mr: 2 }}>
                  {currentMember}님, 환영합니다!
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent">
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          />
          <Divider />
          <List component="nav">
            {mainListItems(
              channels,
              handleChannelSelect,
              handleAddChatChannel,
              handleContextMenu
            )}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems(
              voiceChannels,
              handleChannelSelect,
              handleAddVoiceChannel,
              handleContextMenu
            )}
          </List>
          <Box sx={{ position: "fixed", bottom: 20, left: 20 }}>
            <IconButton onClick={toggleMute} color="primary">
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton onClick={toggleVideo} color="primary">
              {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />

          <Container
            maxWidth="lg"
            sx={{ mt: 4, mb: 4, display: "flex", flexGrow: 1 }}
          >
            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
              <Grid item xs={9} sx={{ height: "100%" }}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {selectedChannel ? (
                    <>
                      {selectedChannel.type === "chat" && (
                        <ChatChannel
                          channel={selectedChannel.name}
                          channelId={selectedChannel.id} // Pass channel ID
                        />
                      )}
                      {selectedChannel.type === "voice" && (
                        <VoiceChannel
                          channel={selectedChannel.name}
                          channelId={selectedChannel.id}
                          isMuted={isMuted}
                          isVideoOff={isVideoOff}
                          ref={voiceChannelRef}
                        />
                      )}
                    </>
                  ) : (
                    <Typography
                      variant="h6"
                      color="inherit"
                      noWrap
                      sx={{ p: 2 }}
                    >
                      No channel selected{" "}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={3} sx={{ height: "100%" }}>
                <UserList ref={userListRef} />
              </Grid>
            </Grid>
          </Container>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={`${currentMember} 님, 환영합니다!`} // Using template literals
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: "auto" }}>
            <Copyright />
          </Box>
        </Box>
      </Box>

      <Dialog open={loginOpen} onClose={handleLoginClose}>
        <DialogContent>
          <Login
            onSignUpOpen={handleSignUpOpen}
            onClose={handleLoginClose}
            onLogin={handleLogin}
            onFindPasswordOpen={handleFindPasswordOpen}
          />{" "}
          {/* onFindPasswordOpen prop 추가 */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={signUpOpen} onClose={handleSignUpClose}>
        <DialogContent>
          <SignUp onLoginOpen={handleLoginOpen} onClose={handleSignUpClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSignUpClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={findPasswordOpen} onClose={handleFindPasswordClose}>
        <DialogContent>
          <FindPassword
            onLoginOpen={handleLoginOpen}
            onClose={handleFindPasswordClose}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFindPasswordClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={changePasswordOpen} onClose={handleChangePasswordClose}>
        <DialogContent>
          <ChangePassword
            onLoginOpen={handleLoginOpen}
            onClose={handleChangePasswordClose}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePasswordClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>{`Username: ${currentMember}`}</MenuItem>
        <MenuItem onClick={handleChangePasswordOpen}>Change Password</MenuItem>
        <MenuItem onClick={handleLogout}>Log Out</MenuItem>
        <MenuItem onClick={handleDeleteAccountOpen}>Delete Account</MenuItem>
      </Menu>

      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditChannel}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="이름 변경하기" />
        </MenuItem>
        <MenuItem onClick={handleDeleteChannel}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="삭제하기" />
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="채널 이름"
            type="text"
            fullWidth
            variant="standard"
            value={channelName}
            onChange={handleChannelNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>취소</Button>
          <Button onClick={handleChannelNameSave}>저장</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteAccountOpen} onClose={handleDeleteAccountClose}>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteAccountClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccountConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

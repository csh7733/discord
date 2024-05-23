import * as React from "react";
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
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { mainListItems, secondaryListItems } from "./listItems";
import ChatChannel from "./Chat";
import UserList from "./UserList";
import discordTheme from "./Theme";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Login from "./Login";
import SignUp from "./SignUp";
import Title from "../assets/title.png";
import TitleText from "../assets/title-text.png";
import avatar1 from "../assets/avatar/1.png";
import avatar2 from "../assets/avatar/2.png";
import avatar3 from "../assets/avatar/3.png";
import VoiceChannel from "./Voice";
import { useCurrentMember } from "../hooks/useCurrentMember";

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

const initialMessagesChannel1 = [
  {
    user: "류지승",
    content: "안녕하세요",
    avatar: avatar2,
    time: "오전 09:52",
  },
  {
    user: "박지원",
    content: "좋은 아침입니다",
    avatar: avatar1,
    time: "오전 09:53",
  },
  {
    user: "최성현",
    content: "아침은 뭐 드셨나요?",
    avatar: avatar3,
    time: "오전 09:53",
  },
  { user: "류지승", content: "김치찌개", avatar: avatar2, time: "오전 09:54" },
];

const initialMessagesChannel2 = [
  {
    user: "류지승",
    content: "안녕하세요",
    avatar: avatar2,
    time: "오후 08:52",
  },
  {
    user: "박지원",
    content: "좋은 저녁입니다",
    avatar: avatar1,
    time: "오후 08:53",
  },
  {
    user: "최성현",
    content: "저녁은 뭐 드셨나요?",
    avatar: avatar3,
    time: "오후 09:53",
  },
  { user: "류지승", content: "된장찌개", avatar: avatar2, time: "오후 10:54" },
];

export default function Dashboard() {
  const { currentMember } = useCurrentMember();
  console.log(currentMember);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [signUpOpen, setSignUpOpen] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState("채팅 채널 1"); // 현재 선택된 채널을 관리하는 상태
  const [channels, setChannels] = React.useState([
    {
      id: 1,
      name: "채팅 채널 1",
      messages: initialMessagesChannel1,
      type: "chat",
    },
    {
      id: 2,
      name: "채팅 채널 2",
      messages: initialMessagesChannel2,
      type: "chat",
    },
  ]); // 채널 목록을 관리하는 상태
  const [voiceChannels, setVoiceChannels] = React.useState([
    { id: 1, name: "음성 채널 1", type: "voice" },
    { id: 2, name: "음성 채널 2", type: "voice" },
  ]); // 음성 채널 목록을 관리하는 상태
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLoginOpen = () => {
    setLoginOpen(true);
    setSignUpOpen(false);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleSignUpOpen = () => {
    setSignUpOpen(true);
    setLoginOpen(false);
  };

  const handleSignUpClose = () => {
    setSignUpOpen(false);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel.name);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // 로그아웃 로직 추가
    console.log("Logged out");
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);
  const menuId = "primary-search-account-menu";

  const handleAddChatChannel = () => {
    const newChannelId = channels.length + 1;
    const newChannel = {
      id: newChannelId,
      name: `채팅 채널 ${newChannelId}`,
      messages: [],
      type: "chat",
    };
    setChannels([...channels, newChannel]);
  };

  const handleAddVoiceChannel = () => {
    const newChannelId = voiceChannels.length + 1;
    const newChannel = {
      id: newChannelId,
      name: `음성 채널 ${newChannelId}`,
      type: "voice",
    };
    setVoiceChannels([...voiceChannels, newChannel]);
  };

  const getInitialMessages = (channelName) => {
    const channel = channels.find((c) => c.name === channelName);
    return channel ? channel.messages : [];
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
            <Button onClick={handleLoginOpen} color="inherit" sx={{ mr: 2 }}>
              Log In
            </Button>
            <Button onClick={handleSignUpOpen} color="inherit" sx={{ mr: 2 }}>
              Register
            </Button>
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
            {channels.map((channel) => (
              <ListItemButton
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
              >
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary={channel.name} />
              </ListItemButton>
            ))}
            <ListItemButton onClick={handleAddChatChannel}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="+ 채팅 채널 추가" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            {voiceChannels.map((channel) => (
              <ListItemButton
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
              >
                <ListItemIcon>
                  <MicIcon />
                </ListItemIcon>
                <ListItemText primary={channel.name} />
              </ListItemButton>
            ))}
            <ListItemButton onClick={handleAddVoiceChannel}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="+ 음성 채널 추가" />
            </ListItemButton>
          </List>
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
                  {selectedChannel.includes("채팅 채널") && (
                    <ChatChannel
                      channel={selectedChannel}
                      initialMessages={getInitialMessages(selectedChannel)}
                    />
                  )}
                  {selectedChannel.includes("음성 채널") && (
                    <VoiceChannel channelId={selectedChannel} />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={3} sx={{ height: "100%" }}>
                <UserList />
              </Grid>
            </Grid>
          </Container>
          <Box sx={{ display: "flex", justifyContent: "center", mt: "auto" }}>
            <Copyright />
          </Box>
        </Box>
      </Box>

      <Dialog open={loginOpen} onClose={handleLoginClose}>
        <DialogContent>
          <Login onSignUpOpen={handleSignUpOpen} onClose={handleLoginClose} />{" "}
          {/* onClose prop 추가 */}
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

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>{`Username: po***@gmail.com`}</MenuItem>
        <MenuItem onClick={handleLogout}>Log Out</MenuItem>
      </Menu>
    </ThemeProvider>
  );
}

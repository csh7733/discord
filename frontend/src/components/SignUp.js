import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Title from "../assets/title.png";

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

export default function SignUp({ onLoginOpen, onClose }) {
  // onClose prop 추가
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { userName, email, password } = Object.fromEntries(data.entries());
    try {
      const response = await axios.post("/api/users", {
        userName,
        email,
        password,
      });
      if (response.status === 200) {
        onClose(); // 회원가입 모달 닫기
        onLoginOpen(); // 로그인 모달 열기
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("Email already exists");
      } else {
        setError("Failed to create account");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img src={Title} alt="Title" style={{ width: 100, height: 100 }} />
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoComplete="name"
              name="userName"
              required
              fullWidth
              id="userName"
              label="User Name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />
          </Grid>
        </Grid>
        {error && (
          <Typography
            color="error"
            variant="body2"
            align="center"
            sx={{ mt: 2 }}
          >
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link href="#" variant="body2" onClick={onLoginOpen}>
              Already have an account? Log In
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Box>
  );
}

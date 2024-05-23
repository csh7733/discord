import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

export default function Login({ onSignUpOpen, onClose }) {
  // onClose prop 추가
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { email, password } = Object.fromEntries(data.entries());
    try {
      const response = await axios.post("/api/login", {
        email,
        password,
      });
      const jwt = response.data;
      localStorage.setItem("token", jwt);
      onClose(); // 로그인 모달 닫기
      navigate("/");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid email or password");
        } else {
          setError("An unexpected error occurred");
        }
      } else {
        setError("Network error");
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
        Log In
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Log In
        </Button>
        <Grid container>
          <Grid item>
            <Link href="#" variant="body2" onClick={onSignUpOpen}>
              {"Don't have an account? Register"}
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Box>
  );
}

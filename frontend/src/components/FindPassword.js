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

export default function FindPassword({ onLoginOpen }) {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { username, email } = Object.fromEntries(data.entries());
    try {
      const response = await axios.post(
        "http://localhost:8080/api/password-find",
        {
          username,
          email,
        }
      );
      const password = response.data;
      setSuccessMessage(`Your password is: ${password}`);
      setError("");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError("No user found with the provided information");
        } else {
          setError("An unexpected error occurred");
        }
      } else {
        setError("Network error");
      }
      setSuccessMessage("");
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
        Find Password
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
        />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        {successMessage && (
          <Typography color="success" variant="body2" align="center">
            {successMessage}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Find Password
        </Button>
        <Grid container>
          <Grid item>
            <Link href="#" variant="body2" onClick={onLoginOpen}>
              {"Go back to login"}
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Box>
  );
}

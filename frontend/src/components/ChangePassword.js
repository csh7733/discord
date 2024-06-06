import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import apiClient from "../apiClient";
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

export default function ChangePassword({ onLoginOpen, onClose }) {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError("New passwords do not match");
      setSuccessMessage("");
      return;
    }

    try {
      const response = await apiClient.put("/users/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmNewPassword: passwords.confirmNewPassword,
      });
      setSuccessMessage("Password changed successfully.");
      setError("");
      onClose();
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data;
        setError(errorMessage);
      } else {
        setError("Network error.");
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
        Change Password
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="currentPassword"
          label="Current Password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passwords.currentPassword}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="newPassword"
          label="New Password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={passwords.newPassword}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmNewPassword"
          label="Confirm New Password"
          name="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          value={passwords.confirmNewPassword}
          onChange={handleChange}
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
          Change Password
        </Button>
        <Grid container></Grid>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Box>
  );
}

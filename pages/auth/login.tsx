import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    if (email == "admin@admin.com" && password == "admin") {
      window.location.href = "/admin";
    }
  };
  return (
    <MainWrapper maxWidth="sm">
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span">
          LOG IN
        </Typography>
        <TextField
          required
          label="Email"
          type="email"
          size="small"
          sx={{ margin: "10px 0" }}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          size="small"
          sx={{ margin: "10px 0" }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Log In
        </Button>
      </Box>
    </MainWrapper>
  );
};

export default Login;

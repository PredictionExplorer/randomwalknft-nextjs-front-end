import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setCookie = (cname: string, cvalue: string, exhours: number) => {
    const d = new Date();
    d.setTime(d.getTime() + exhours * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  };
  const handleLogin = async () => {
    const data = await api.login(email, password);
    if (data.result === "success") {
      setCookie("randomwalknft_token", data.token, 1);
      setCookie("randomwalknft_email", email, 1);
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

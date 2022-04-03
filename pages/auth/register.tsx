import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleRegister = async () => {
    await api.register(username, email, password);
  };
  return (
    <MainWrapper maxWidth="sm">
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span">
          REGISTER
        </Typography>
        <TextField
          required
          label="Username"
          size="small"
          sx={{ margin: "10px 0" }}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register
        </Button>
      </Box>
    </MainWrapper>
  );
};

export default Register;

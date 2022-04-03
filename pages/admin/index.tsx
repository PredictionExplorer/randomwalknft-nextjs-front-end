import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  TextareaAutosize,
  styled,
} from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";

const Input = styled("input")({
  display: "none",
});

const Login = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleAdd = () => {};
  return (
    <MainWrapper>
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span">
          ADD BLOG
        </Typography>
        <TextField
          required
          id="title"
          name="title"
          label="Title"
          size="small"
          sx={{ margin: "10px 0" }}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="contained-button-file">
          <Input accept="image/*" id="contained-button-file" type="file" />
          <Button variant="contained" component="span">
            Upload
          </Button>
        </label>
        <TextareaAutosize
          minRows={10}
          placeholder="Content"
          style={{ margin: "10px 0" }}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add
        </Button>
      </Box>
    </MainWrapper>
  );
};

export default Login;

import React, { useState } from "react";
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
import { GetServerSidePropsContext } from "next";

const Input = styled("input")({
  display: "none",
});

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [epic, setEpic] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [notification, setNotification] = useState("");
  const handleAdd = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("epic", epic);
    formData.append("content", content);
    formData.append("thumbnailImage", thumbnailImage);
    formData.append("bannerImage", bannerImage);
    const data = await api.create_blog(formData);
    if (data.result === "success") {
      setNotification("Blog is created successfully!");
      setTimeout(() => {
        setNotification("");
        setTitle("");
        setEpic("");
        setContent("");
        setThumbnailImage(null);
        setBannerImage(null);
      }, 3000);
    }
  };
  return (
    <MainWrapper>
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span" marginBottom="20px">
          ADD BLOG
        </Typography>
        {notification && (
          <Typography
            variant="body1"
            component="span"
            sx={{
              padding: "5px 10px",
              marginBottom: "20px",
              border: "1px solid #C676D7",
              borderRadius: "5px",
            }}
          >
            {notification}
          </Typography>
        )}
        <TextField
          required
          id="title"
          name="title"
          label="Title"
          size="small"
          sx={{ margin: "10px 0" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          required
          id="epic"
          name="epic"
          label="Epic"
          size="small"
          sx={{ margin: "10px 0" }}
          value={epic}
          onChange={(e) => setEpic(e.target.value)}
        />
        <Box display="flex" gap="30px">
          <label htmlFor="thumbnail-image">
            <Input
              accept="image/*"
              id="thumbnail-image"
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setThumbnailImage(e.target.files[0]);
                } else {
                  setThumbnailImage(null);
                }
              }}
            />
            <Button variant="contained" component="span">
              Thumbnail Image
            </Button>
            {thumbnailImage && (
              <img
                alt="not fount"
                width={"32px"}
                height={"32px"}
                src={URL.createObjectURL(thumbnailImage)}
                style={{ verticalAlign: "middle" }}
              />
            )}
          </label>
          <label htmlFor="banner-image">
            <Input
              accept="image/*"
              id="banner-image"
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setBannerImage(e.target.files[0]);
                } else {
                  setBannerImage(null);
                }
              }}
            />
            <Button variant="contained" component="span">
              Banner Image
            </Button>
            {bannerImage && (
              <img
                alt="not fount"
                width={"32px"}
                height={"32px"}
                src={URL.createObjectURL(bannerImage)}
                style={{ verticalAlign: "middle" }}
              />
            )}
          </label>
        </Box>
        <TextareaAutosize
          minRows={10}
          placeholder="Content"
          style={{ margin: "10px 0" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add
        </Button>
      </Box>
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const email = context.req.cookies["randomwalknft_email"] || " ";
  const token = context.req.cookies["randomwalknft_token"] || " ";
  const data = await api.check_token(email, token);
  if (data.result !== "success") {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}

export default CreateBlog;

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
import dynamic from "next/dynamic";

const RTEditor = dynamic(() => import("../../components/RTEditor"), {
  ssr: false,
});

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
  const [isAdding, setAdding] = useState(false);
  const handleAdd = async () => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, " ")
      .replace(/ +/g, "-");
    const res = await api.get_blog_by_title(slug);
    if (res && res.id) {
      setNotification("This title already exists on the database!");
      return;
    }
    setAdding(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("epic", epic);
    formData.append("content", content);
    formData.append("thumbnailImage", thumbnailImage);
    formData.append("bannerImage", bannerImage);
    const data = await api.create_blog(formData);
    if (data && data.result === "success") {
      setNotification("Blog is created successfully!");
      setTimeout(() => {
        setNotification("");
        setTitle("");
        setEpic("");
        setContent("");
        setThumbnailImage(null);
        setBannerImage(null);
      }, 3000);
    } else {
      setNotification("An error was occuried while adding blog!");
    }
    setAdding(false);
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

        <RTEditor content={content} setContent={setContent} />

        <Box sx={{ display: "flex", justifyContent: "end" }}>
          <Button
            variant="contained"
            color="primary"
            disabled={isAdding}
            onClick={() => {
              window.location.href = "/admin";
            }}
            sx={{ marginRight: "10px" }}
          >
            Go To List
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={isAdding}
            onClick={handleAdd}
          >
            Add
          </Button>
        </Box>
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

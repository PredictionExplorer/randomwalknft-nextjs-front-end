import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  TextareaAutosize,
  styled,
} from "@mui/material";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import { MainWrapper } from "../../../components/styled";
import api from "../../../services/api";

const RTEditor = dynamic(() => import("../../../components/RTEditor"), {
  ssr: false,
});

const Input = styled("input")({
  display: "none",
});

const BlogEdit = ({ blog }) => {
  const [title, setTitle] = useState(blog.title);
  const [epic, setEpic] = useState(blog.epic);
  const [content, setContent] = useState(blog.content);
  const [thumbnailImage, setThumbnailImage] = useState(blog.thumb_image);
  const [bannerImage, setBannerImage] = useState(blog.banner_image);
  const [notification, setNotification] = useState("");
  const [isUpdating, setUpdating] = useState(false);

  const handleEdit = async () => {
    setUpdating(true);
    const formData = new FormData();
    formData.append("blog_id", blog.id);
    formData.append("title", title);
    formData.append("epic", epic);
    formData.append("content", content);
    if (typeof thumbnailImage !== "string") {
      formData.append("thumbnailImage", thumbnailImage);
    }
    if (typeof bannerImage !== "string") {
      formData.append("bannerImage", bannerImage);
    }
    const data = await api.edit_blog(formData);
    if (data && data.result === "success") {
      setNotification("Blog is updated successfully!");
    } else {
      setNotification("An error was occured while updating the blog!");
    }

    setUpdating(false);
  };
  return (
    <MainWrapper>
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span" marginBottom="20px">
          EDIT BLOG
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
                src={
                  typeof thumbnailImage === "string"
                    ? thumbnailImage
                    : URL.createObjectURL(thumbnailImage)
                }
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
                src={
                  typeof bannerImage === "string"
                    ? bannerImage
                    : URL.createObjectURL(bannerImage)
                }
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
            disabled={isUpdating}
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
            disabled={isUpdating}
            onClick={handleEdit}
          >
            Update
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
  const id = context.params!.id;
  const blogId = Array.isArray(id) ? id[0] : id;
  const blog = await api.get_blog(blogId);
  return {
    props: { blog },
  };
}

export default BlogEdit;

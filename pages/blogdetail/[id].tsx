import React from "react";
import { Box, Typography, CardMedia, IconButton } from "@mui/material";
import { Twitter, Facebook, Instagram, Share } from "@mui/icons-material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { GetServerSidePropsContext } from "next";

const BlogDetail = ({ blog }) => {
  const getDateFromTimestamp = (timestamp: number) => {
    const month_names = [
      "January",
      "Feburary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = month_names[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  return (
    <MainWrapper style={{ paddingLeft: 0, paddingRight: 0 }}>
      <Typography variant="h4" sx={{ mb: "24px" }}>
        {blog.title || "No Title"}
      </Typography>
      <Typography
        gutterBottom
        component="span"
        sx={{
          fontSize: 14,
          backgroundColor: "#C676D7",
          px: "11px",
          py: "8px",
        }}
      >
        Published on {getDateFromTimestamp(blog.created_at)}
      </Typography>
      <CardMedia sx={{ mt: "30px" }} component="img" src={blog.banner_image} />
      <Box display="flex" marginTop="40px">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          marginRight="50px"
        >
          <Typography variant="h6" color="#A8A8A8" marginBottom="12px">
            Share
          </Typography>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Twitter />
          </IconButton>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Facebook />
          </IconButton>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Instagram />
          </IconButton>
          <IconButton color="primary" sx={{ background: "#200C31" }}>
            <Share />
          </IconButton>
        </Box>
        <Box>
          <Typography variant="body1">{blog.content}</Typography>
        </Box>
      </Box>
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const blogId = Array.isArray(id) ? id[0] : id;
  const blog = await api.get_blog(blogId);
  return {
    props: { blog },
  };
}

export default BlogDetail;

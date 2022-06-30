import React from "react";
import { Box, Typography, CardMedia } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";

const RTViewer = dynamic(() => import("../../components/RTViewer"), {
  ssr: false,
});

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
      <CardMedia
        sx={{ mt: "30px", maxHeight: "400px", objectFit: "contain" }}
        component="img"
        src={blog.banner_image}
      />
      <Box marginTop="40px">
        <RTViewer content={blog.content} />
      </Box>
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let id = context.params!.id;
  id = Array.isArray(id) ? id[0] : id;
  const blog = await api.get_blog_by_title(id);
  return {
    props: { blog },
  };
}

export default BlogDetail;

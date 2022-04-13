import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import PaginationBlogGrid from "../components/PaginationBlogGrid";

const Blog = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const getAllBlogs = async () => {
      const data = await api.get_all_blogs();
      setBlogs(data);
      setLoading(false);
    };
    getAllBlogs();
  }, []);
  return (
    <MainWrapper>
      <Box display="flex" flexWrap="wrap">
        <Typography variant="h4" component="span">
          OUR
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="primary"
          sx={{ ml: 1.5 }}
        >
          BLOG
        </Typography>
      </Box>

      <PaginationBlogGrid loading={loading} data={blogs} />
    </MainWrapper>
  );
};

export default Blog;

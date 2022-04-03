import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import PaginationBlogGrid from "../components/PaginationBlogGrid";

const Blog = () => {
  const [loading, setLoading] = useState(false);
  // const [collection, setCollection] = useState([]);
  const collection = [1, 2, 3, 4, 5, 6, 7, 8];
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

      <PaginationBlogGrid loading={loading} data={collection} />
    </MainWrapper>
  );
};

export default Blog;

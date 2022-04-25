import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
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
    <>
      <Head>
        <title>Blog | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
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
    </>
  );
};

export default Blog;

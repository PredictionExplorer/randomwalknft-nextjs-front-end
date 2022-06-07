import React, { useEffect, useState } from "react";
import { Box, Typography, Pagination, CircularProgress } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { GetServerSidePropsContext } from "next";
import BlogListItem from "../../components/BlogListItem";

const BlogList = () => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const getAllBlogs = async () => {
      const data = await api.get_all_blogs();
      console.log(data);
      setBlogs(data);
      setLoading(false);
    };
    getAllBlogs();
  }, []);
  return (
    <MainWrapper>
      <Box display="flex" flexDirection="column">
        <Typography variant="h4" component="span" marginBottom="20px">
          BLOGS
        </Typography>
        {loading && (
          <Box display="flex" justifyContent="center">
            <CircularProgress color="secondary" />
          </Box>
        )}
        {blogs.length > 0 && (
          <>
            <Box>
              {blogs
                .slice(perPage * (curPage - 1), perPage * curPage)
                .map((blog, i) => (
                  <BlogListItem key={i} blog={blog} />
                ))}
            </Box>
            <Box display="flex" justifyContent="center" py={3}>
              <Pagination
                color="primary"
                page={curPage}
                onChange={(e, page) => setCurPage(page)}
                count={Math.ceil(blogs.length / perPage)}
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
        {!loading && !blogs.length && (
          <Typography variant="h6" align="center">
            Nothing Found!
          </Typography>
        )}
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

export default BlogList;

import React, { useState } from "react";
import { Typography, Button, Box, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../services/api";

const BlogListItem = ({ blog }) => {
  const [status, setStatus] = useState(blog.status);
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
  const onDelete = async () => {
    const res = await api.delete_blog(blog.id);
    console.log(res);
  };
  const onShowOrHide = async () => {
    setStatus(!status);
    console.log(status);
    const res = await api.toggle_blog(blog.id, status);
    console.log(res);
  };
  return (
    <Box>
      <Box sx={{ display: "flex", gap: "30px", margin: "20px 0" }}>
        <Box
          component="img"
          src={blog.thumb_image}
          alt="blog thumbnail"
          width="120px"
          height="120px"
          sx={{ objectFit: "cover" }}
        />
        <Box flex={1}>
          <Typography
            gutterBottom
            component="span"
            sx={{
              fontSize: 14,
            }}
          >
            {getDateFromTimestamp(blog.created_at)}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            marginTop="10px"
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {blog.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {blog.epic}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "150px",
            justifyContent: "center",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityIcon />}
            color="success"
            size="small"
          >
            Show
          </Button>
          {status ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VisibilityOffIcon />}
              color="warning"
              size="small"
              onClick={onShowOrHide}
            >
              Hide
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EditIcon />}
              color="primary"
              size="small"
              onClick={onShowOrHide}
            >
              Edit
            </Button>
          )}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeleteIcon />}
            color="error"
            size="small"
            onClick={onDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};

export default BlogListItem;

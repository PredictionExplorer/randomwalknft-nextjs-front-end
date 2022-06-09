import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../services/api";

const BlogListItem = ({ blog, onDelete }) => {
  const [status, setStatus] = useState(blog.status);
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

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
  const onShowOrHide = async () => {
    const res = await api.toggle_blog(blog.id, !status);
    if (res.result === "success") {
      setStatus(!status);
    }
  };
  const onEdit = async () => {
    window.location.href = `/admin/blogedit/${blog.id}`;
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
              startIcon={<VisibilityIcon />}
              color="success"
              size="small"
              onClick={onShowOrHide}
            >
              Show
            </Button>
          )}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EditIcon />}
            color="primary"
            size="small"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeleteIcon />}
            color="error"
            size="small"
            onClick={handleClickOpen}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <Divider />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Warning</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to delete this blog?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Disagree
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await onDelete(blog.id);
              handleClose();
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogListItem;

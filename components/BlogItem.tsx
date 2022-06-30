import React from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";

const BlogItem = ({ blog }) => {
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

  const getUrl = (blog) => {
    const slug = blog.title
      .toLowerCase()
      .replace(/[^\w ]+/g, " ")
      .replace(/ +/g, "-");
    return "/blog/" + slug;
  };
  return (
    <Card>
      <CardMedia
        component="img"
        height="230"
        image={blog.thumb_image}
        alt="blog thumbnail"
      />
      <CardContent>
        <Typography
          gutterBottom
          component="span"
          sx={{
            fontSize: 14,
            backgroundColor: "#C676D7",
            px: "11px",
            py: "3px",
          }}
        >
          {getDateFromTimestamp(blog.created_at)}
        </Typography>
        <Typography gutterBottom variant="h5" component="div" marginTop="10px">
          {blog.title || "No Title"}
        </Typography>
        <Typography variant="body2">{blog.epic || "No description"}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" href={getUrl(blog)}>
          Read more...
        </Button>
      </CardActions>
    </Card>
  );
};

export default BlogItem;

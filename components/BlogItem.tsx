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
  return (
    <Card>
      <CardMedia
        component="img"
        height="230"
        image="https://via.placeholder.com/150"
        alt="green iguana"
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
          March 22, 2022
        </Typography>
        <Typography gutterBottom variant="h5" component="div" marginTop="10px">
          Lizard
        </Typography>
        <Typography variant="body2">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" href="/blogdetail/1">
          Read more...
        </Button>
      </CardActions>
    </Card>
  );
};

export default BlogItem;

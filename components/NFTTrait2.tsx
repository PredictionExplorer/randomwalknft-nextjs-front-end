import React, { useState, useEffect } from "react";
import { Typography, CardActionArea, Grid, Button, Box } from "@mui/material";
import { StyledCard, NFTImage, NFTInfoWrapper } from "./styled";

const NFTTrait2 = ({ id, clickHandler }) => {
  const [black_image_url, setBlackImage] = useState(null);

  const handleDetails = async () => {
    window.open(`/detail/${id}`);
  };

  useEffect(() => {
    const getToken = async () => {
      const fileName = id.toString().padStart(6, "0");
      setBlackImage(
        `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`
      );
    };
    getToken();
  }, [id]);

  return (
    <>
      <StyledCard>
        <CardActionArea onClick={clickHandler}>
          {black_image_url && <NFTImage image={black_image_url} />}
          <NFTInfoWrapper>
            <Typography
              variant="body1"
              gutterBottom
              sx={{
                color: "#FFFFFF",
              }}
            ></Typography>
          </NFTInfoWrapper>
        </CardActionArea>
      </StyledCard>
      <Box mt={2}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={4}>
            <Button
              variant="outlined"
              color="primary"
              style={{ width: "100%" }}
              onClick={handleDetails}
            >
              Details
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default NFTTrait2;

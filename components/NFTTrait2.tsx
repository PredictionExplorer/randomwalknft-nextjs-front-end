import React, { useState, useEffect } from "react";
import { Typography, CardActionArea, Grid } from "@mui/material";

import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import "react-modal-video/css/modal-video.min.css";
import { formatId } from "../utils";
import { StyledCard, NFTImage, NFTInfoWrapper } from "./styled";

const NFTTrait2 = ({ id }) => {
  const [imageOpen, setImageOpen] = useState(false);
  const [black_image_url, setBlackImage] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const fileName = id.toString().padStart(6, "0");
      setBlackImage(
        `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black.png`
      );
    };
    getToken();
  }, [id]);

  return (
    <>
      <StyledCard>
        <CardActionArea onClick={() => setImageOpen(true)}>
          {black_image_url && <NFTImage image={black_image_url} />}
          <NFTInfoWrapper>
            <Typography
              variant="body1"
              gutterBottom
              sx={{
                color: "#FFFFFF",
              }}
            >
              {formatId(id)}
            </Typography>
          </NFTInfoWrapper>
        </CardActionArea>
      </StyledCard>
      {imageOpen && (
        <Lightbox image={black_image_url} onClose={() => setImageOpen(false)} />
      )}
    </>
  );
};

export default NFTTrait2;

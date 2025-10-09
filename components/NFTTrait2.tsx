import React, { useState, useEffect } from "react";
import { Typography, CardActionArea, Grid, Button, Box } from "@mui/material";
import Image from "next/image";
import { StyledCard, NFTSkeleton, NFTInfoWrapper } from "./styled";
import { getAssetsUrl } from "../utils";

const NFTTrait2 = ({ id, clickHandler }) => {
  const [black_image_url, setBlackImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDetails = async () => {
    window.open(`/detail/${id}`);
  };

  useEffect(() => {
    const getToken = async () => {
      const fileName = id.toString().padStart(6, "0");
      setBlackImage(getAssetsUrl(`${fileName}_black_thumb.jpg`));
    };
    getToken();
  }, [id]);

  return (
    <>
      <StyledCard>
        <CardActionArea onClick={clickHandler}>
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '64%' }}>
            {!imageLoaded && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <NFTSkeleton animation="wave" variant="rectangular" />
              </Box>
            )}
            {black_image_url && (
              <Image
                src={black_image_url}
                alt={`NFT ${id}`}
                layout="fill"
                objectFit="cover"
                sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzIwMEMzMSIvPjwvc3ZnPg=="
                onLoadingComplete={() => setImageLoaded(true)}
              />
            )}
          </Box>
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

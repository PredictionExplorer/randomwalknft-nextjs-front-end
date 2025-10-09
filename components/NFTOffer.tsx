import React, { useState } from "react";
import { Typography, CardActionArea, Box } from "@mui/material";
import Image from "next/image";

import { NFTSkeleton, NFTInfoWrapper, NFTPrice, StyledCard } from "./styled";
import { formatId, getAssetsUrl } from "../utils";

const NFTOffer = ({ offer }) => {
  const fileName = offer.TokenId.toString().padStart(6, "0");
  const image_thumb = getAssetsUrl(`${fileName}_black_thumb.jpg`);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <StyledCard>
      <CardActionArea
        href={`/detail/${offer.TokenId}?seller=${offer.SellerAddr}`}
      >
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '64%' }}>
          {!imageLoaded && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <NFTSkeleton animation="wave" variant="rectangular" />
            </Box>
          )}
          <Image
            src={image_thumb}
            alt={`NFT ${formatId(offer.TokenId)}`}
            layout="fill"
            objectFit="cover"
            sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzIwMEMzMSIvPjwvc3ZnPg=="
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </Box>
        <NFTInfoWrapper>
          <Typography variant="body1" gutterBottom>
            {formatId(offer.TokenId)}
          </Typography>
          <NFTPrice variant="body1">{offer.Price.toFixed(4)}Ξ</NFTPrice>
        </NFTInfoWrapper>
      </CardActionArea>
    </StyledCard>
  );
};

export default NFTOffer;

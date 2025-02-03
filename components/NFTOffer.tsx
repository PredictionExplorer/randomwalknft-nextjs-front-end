import React from "react";
import { Typography, CardActionArea } from "@mui/material";

import { NFTImage, NFTInfoWrapper, NFTPrice, StyledCard } from "./styled";
import { formatId } from "../utils";

const NFTOffer = ({ offer }) => {
  const fileName = offer.TokenId.toString().padStart(6, "0");
  const image_thumb = `http://69.10.55.2/images/randomwalk/${fileName}_black_thumb.jpg`;

  return (
    <StyledCard>
      <CardActionArea
        href={`/detail/${offer.TokenId}?seller=${offer.SellerAddr}`}
      >
        <NFTImage image={image_thumb} />
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

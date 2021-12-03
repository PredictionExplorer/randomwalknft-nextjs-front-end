import React from 'react'
import { Typography, CardActionArea } from '@mui/material'

import { NFTImage, NFTInfoWrapper, NFTPrice, StyledCard } from './styled'
import { formatId } from '../utils'

const NFTOffer = ({ offer }) => {
  return (
    <StyledCard>
      <CardActionArea href={`/detail/${offer.tokenId}?seller=${offer.seller}`}>
        <NFTImage image={offer.image_thumb} />
        <NFTInfoWrapper>
          <Typography variant="body1" gutterBottom>
            {formatId(offer.tokenId)}
          </Typography>
          <NFTPrice variant="body1">{offer.price.toFixed(4)}Ξ</NFTPrice>
        </NFTInfoWrapper>
      </CardActionArea>
    </StyledCard>
  )
}

export default NFTOffer

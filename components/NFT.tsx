import React from 'react'
import { Typography, CardActionArea } from '@mui/material'

import { useNFT } from '../hooks/useNFT'
import { formatId } from '../utils'
import { NFTImage, NFTSkeleton, NFTInfoWrapper, StyledCard } from './styled'

const NFT = ({ tokenId }) => {
  const nft = useNFT(tokenId)

  return (
    <StyledCard>
      <CardActionArea href={nft ? `/detail/${nft.id}` : '#'}>
        {!nft ? (
          <NFTSkeleton animation="wave" variant="rectangular" />
        ) : (
          <NFTImage image={nft.black_image_thumb} />
        )}
        {nft && (
          <NFTInfoWrapper>
            <Typography variant="body1">{formatId(nft.id)}</Typography>
          </NFTInfoWrapper>
        )}
      </CardActionArea>
    </StyledCard>
  )
}

export default NFT

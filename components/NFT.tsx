import React, { useState } from 'react'
import { Typography, CardActionArea, Box } from '@mui/material'
import Image from 'next/image'

import { useNFT } from '../hooks/useNFT'
import { formatId } from '../utils'
import { NFTSkeleton, NFTInfoWrapper, StyledCard } from './styled'

const NFT = ({ tokenId }) => {
  const nft = useNFT(tokenId)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <StyledCard>
      <CardActionArea href={nft ? `/detail/${nft.id}` : '#'}>
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '64%' }}>
          {!imageLoaded && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <NFTSkeleton animation="wave" variant="rectangular" />
            </Box>
          )}
          {nft && (
            <Image
              src={nft.black_image_thumb}
              alt={`NFT ${formatId(nft.id)}`}
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

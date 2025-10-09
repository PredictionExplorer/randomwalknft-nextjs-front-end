import React from 'react'
import Image from 'next/image'
import { Box } from '@mui/material'

import { VideoCard } from './styled'

const NFTVideo = ({ image_thumb, onClick }) => (
  <VideoCard>
    <Box sx={{ position: 'relative', width: '100%', paddingTop: '64%', opacity: 0.55 }}>
      <Image
        src={image_thumb}
        alt="NFT Video Thumbnail"
        layout="fill"
        objectFit="cover"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
        loading="lazy"
      />
    </Box>
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
      }}
    >
      <Image
        src={'/images/play.png'}
        alt="play"
        onClick={onClick}
        width={85}
        height={84}
      />
    </div>
  </VideoCard>
)

export default NFTVideo

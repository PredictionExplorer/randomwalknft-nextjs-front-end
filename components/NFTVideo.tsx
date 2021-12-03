import React from 'react'
import Image from 'next/image'

import { VideoCard, NFTImage } from './styled'

const NFTVideo = ({ image_thumb, onClick }) => (
  <VideoCard>
    <NFTImage image={image_thumb} style={{ opacity: 0.55 }} />
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

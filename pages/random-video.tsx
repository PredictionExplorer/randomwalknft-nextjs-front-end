import React, { useEffect, useState, useRef } from 'react'
import { Typography, Link } from '@mui/material'

import ApiService from '../services/api'
import { formatId } from '../utils'

const RandomVideo = (props) => {
  const [tokenId, setTokenId] = useState(null)
  const [blackVideo, setBlackVideo] = useState(null)
  const ref = useRef(null)

  const setRandomVideo = async () => {
    const tokenIds = await ApiService.random()
    const fileName = tokenIds[0].toString().padStart(6, '0')
    setTokenId(tokenIds[0])
    setBlackVideo(
      `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_single.mp4`,
    )
  }

  useEffect(() => {
    setRandomVideo()
  }, [])

  useEffect(() => {
    if (blackVideo) {
      ref.current.play()
    }
  }, [blackVideo])

  return (
    <>
      {blackVideo && (
        <div
          style={{
            position: 'absolute',
            top: 125,
            bottom: 64,
            left: 0,
            right: 0,
          }}
        >
          <video
            autoPlay
            muted
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            onEnded={setRandomVideo}
            ref={ref}
          >
            <source src={blackVideo} type="video/mp4"></source>
          </video>
        </div>
      )}
      {tokenId && (
        <Typography
          variant="h6"
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Link style={{ color: '#fff' }} href={`/detail/${tokenId}`}>
            {formatId(tokenId)}
          </Link>
        </Typography>
      )}
    </>
  )
}

export default RandomVideo

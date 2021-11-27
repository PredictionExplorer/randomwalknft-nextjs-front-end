import React from 'react'
import Image from 'next/image'
import { Box, Typography, Button, Link, Hidden } from '@mui/material'
import { MainWrapper, CenterBox, MintButton } from '../components/styled'

function Home() {
  return (
    <>
      <div
        style={{
          // backgroundImage: `url(${backImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          height: '100vh',
        }}
      >
        <MainWrapper>
          <CenterBox>
            <Typography variant="h4" component="span" color="primary">
              RANDOM
            </Typography>
            <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
              WALK
            </Typography>
            <Typography
              variant="h4"
              component="span"
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              NFT
            </Typography>
          </CenterBox>
          <Box mt={3}>
            <Typography align="left" variant="body1" gutterBottom>
              100% of the ΞTH spent on minting goes back to the minters through
              an&nbsp;
              <Link href="/redeem" style={{ cursor: 'pointer' }}>
                interesting mechanism
              </Link>
              .
            </Typography>
            <Typography align="left" variant="body1" gutterBottom>
              Trade your NFTs on the built in 0.00% fee marketplace.
            </Typography>
          </Box>
          <CenterBox mt={3}>
            <MintButton href="/mint">Mint now</MintButton>
            <Hidden smDown>
              <div
                style={{
                  // background: `url(${whiteLineImage}) left top`,
                  width: 64,
                  height: 8,
                }}
              ></div>
            </Hidden>
          </CenterBox>
        </MainWrapper>
      </div>
    </>
  )
}

export default Home

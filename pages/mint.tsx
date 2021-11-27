import React, { useState, useEffect } from 'react'
import { Typography, Box, Grid } from '@mui/material'
import { ethers } from 'ethers'
import Countdown from 'react-countdown'

import { MainWrapper, CenterBox } from '../components/styled'

import { useActiveWeb3React } from '../hooks/web3'

const Mint = () => {
  const [saleSeconds, setSaleSeconds] = useState(null)
  const [countdownCompleted, setCountdownCompleted] = useState(false)
  const [mintPrice, setMintPrice] = useState(0)
  const [withdrawalAmount, setWithdrawalAmount] = useState(0)
  const [tokenIds, setTokenIds] = useState([])

  const { account, library } = useActiveWeb3React()

  return (
    <MainWrapper>
      {saleSeconds > 0 && !countdownCompleted ? (
        <CenterBox>
          <Typography variant="h4" component="span">
            SALE
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            OPENS IN
          </Typography>
        </CenterBox>
      ) : (
        <CenterBox>
          <Typography variant="h4" component="span">
            GET A
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            RANDOM WALK
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            NFT AT
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            {mintPrice}Ξ
          </Typography>
        </CenterBox>
      )}
      <Box mt={3}>
        <Grid container spacing={4}>
          {saleSeconds > 0 && !countdownCompleted && (
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Box mb={2}>
                <Countdown
                  date={Date.now() + saleSeconds * 1000}
                  renderer={Counter}
                  onComplete={() => setCountdownCompleted(true)}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sm={12} md={6} lg={saleSeconds <= 0 ? 7 : 6}>
            <Box mb={3}>
              <Typography variant="body1" color="secondary" gutterBottom>
                Withdrawal to mint ratio
              </Typography>
              <Typography variant="body2" gutterBottom>
                <span>{(withdrawalAmount / mintPrice).toFixed(2)}</span>
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body1" color="secondary" gutterBottom>
                Verified NFT Contract
              </Typography>
              <Typography variant="body2" gutterBottom>
                <MuiLink
                  color="textPrimary"
                  target="_blank"
                  href={`https://arbiscan.io/address/${NFT_ADDRESS}#code`}
                >
                  {NFT_ADDRESS}
                </MuiLink>
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body1" color="secondary" gutterBottom>
                Verified Market Contract
              </Typography>
              <Typography variant="body2" gutterBottom>
                <MuiLink
                  color="textPrimary"
                  target="_blank"
                  href={`https://arbiscan.io/address/${MARKET_ADDRESS}#code`}
                >
                  {MARKET_ADDRESS}
                </MuiLink>
              </Typography>
            </Box>
            <Box className={classes.centerMobile}>
              <Hidden smDown>
                <div
                  style={{
                    background: `url(${pinkLineImage}) left top`,
                    width: 64,
                    height: 8,
                  }}
                ></div>
              </Hidden>
              <Button className={classes.mintActiveButton} onClick={handleMint}>
                Mint now
              </Button>
            </Box>
          </Grid>
          {(saleSeconds <= 0 || countdownCompleted) && tokenIds.length > 0 && (
            <Grid item xs={12} sm={12} md={6} lg={5}>
              <Fade autoplay arrows={false}>
                {tokenIds.map((id, i) => {
                  const fileName = id.toString().padStart(6, '0')
                  return (
                    <Card key={i} style={{ filter: 'none', margin: 2 }}>
                      <CardActionArea component={Link} to={`/detail/${id}`}>
                        <CardMedia
                          className={classes.nftImage}
                          image={`https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`}
                        />
                        <Typography
                          color="textPrimary"
                          className={classes.nftInfo}
                          variant="body1"
                        >
                          {formatId(id)}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  )
                })}
              </Fade>
            </Grid>
          )}
        </Grid>
      </Box>
    </MainWrapper>
  )
}

export default Mint

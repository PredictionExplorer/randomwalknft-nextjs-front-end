import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardActionArea,
  Hidden,
  Link,
} from '@mui/material'
import Countdown from 'react-countdown'
import { Fade } from 'react-slideshow-image'

import { NFT_ADDRESS, MARKET_ADDRESS } from '../config/app'
import {
  MainWrapper,
  CenterBox,
  NavLink,
  MintActiveButton,
  NFTImage,
  NFTInfoWrapper,
} from '../components/styled'
import Counter from '../components/Counter'

import useNFTContract from '../hooks/useNFTContract'
import useMarketContract from '../hooks/useMarketContract'

import { formatId, parseBalance } from '../utils'

const Mint = () => {
  const [saleSeconds, setSaleSeconds] = useState(null)
  const [countdownCompleted, setCountdownCompleted] = useState(false)
  const [mintPrice, setMintPrice] = useState('0')
  const [withdrawalAmount, setWithdrawalAmount] = useState('0')
  const [tokenIds, setTokenIds] = useState([])

  const nftContract = useNFTContract(NFT_ADDRESS)
  const marketContract = useMarketContract(MARKET_ADDRESS)

  const handleMint = () => {}

  useEffect(() => {
    const getData = async () => {
      const mintPrice = await nftContract.getMintPrice()
      setMintPrice(
        (parseFloat(parseBalance(mintPrice)) * 1.01 + 0.008).toFixed(4),
      )

      const withdrawalAmount = await nftContract.withdrawalAmount()
      setWithdrawalAmount(parseBalance(withdrawalAmount))

      let seconds = (await nftContract.timeUntilSale()).toNumber()
      setSaleSeconds(seconds)

      // const tokenIds = await nftService.random()
      // setTokenIds(tokenIds)
    }

    getData()
  }, [nftContract, marketContract])

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
                <span>
                  {(
                    parseFloat(withdrawalAmount) / parseFloat(mintPrice)
                  ).toFixed(2)}
                </span>
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body1" color="secondary" gutterBottom>
                Verified NFT Contract
              </Typography>
              <Typography variant="body2" gutterBottom>
                <NavLink
                  color="textPrimary"
                  target="_blank"
                  href={`https://arbiscan.io/address/${NFT_ADDRESS}#code`}
                >
                  {NFT_ADDRESS}
                </NavLink>
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body1" color="secondary" gutterBottom>
                Verified Market Contract
              </Typography>
              <Typography variant="body2" gutterBottom>
                <NavLink
                  color="textPrimary"
                  target="_blank"
                  href={`https://arbiscan.io/address/${MARKET_ADDRESS}#code`}
                >
                  {MARKET_ADDRESS}
                </NavLink>
              </Typography>
            </Box>
            <CenterBox>
              <Hidden smDown>
                <div
                  style={{
                    background: `url('images/pink_line.png') left top`,
                    width: 64,
                    height: 8,
                  }}
                ></div>
              </Hidden>
              <MintActiveButton onClick={handleMint}>Mint now</MintActiveButton>
            </CenterBox>
          </Grid>
          {(saleSeconds <= 0 || countdownCompleted) && tokenIds.length > 0 && (
            <Grid item xs={12} sm={12} md={6} lg={5}>
              <Fade autoplay arrows={false}>
                {tokenIds.map((id, i) => {
                  const fileName = id.toString().padStart(6, '0')
                  return (
                    <Card key={i} style={{ filter: 'none', margin: 2 }}>
                      <CardActionArea>
                        <NFTImage
                          image={`https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`}
                        />
                        <NFTInfoWrapper>{formatId(id)}</NFTInfoWrapper>
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

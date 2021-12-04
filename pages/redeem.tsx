import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import moment from 'moment'
import { Button, Box, Typography, Grid, Paper } from '@mui/material'
import Countdown from 'react-countdown'

import { CenterBox, MainWrapper, StyledLink } from '../components/styled'
import Counter from '../components/Counter'
import useNFTContract from '../hooks/useNFTContract'

const Redeem = () => {
  const [withdrawalSeconds, setWithdrawalSeconds] = useState(null)
  const [lastMinter, setLastMinter] = useState(null)
  const [withdrawalAmount, setWithdrawalAmount] = useState(null)

  const contract = useNFTContract()

  const handleWithdraw = async () => {
    try {
      const receipt = await contract.withdraw().then((tx) => tx.wait())

      console.log(receipt)
    } catch (err) {
      if (err.data.code === -32000) {
        alert('The withdrawal is not open yet.')
      } else {
        alert(
          'You are not the last minter, you need to mint to become the last minter',
        )
      }
    }
  }

  useEffect(() => {
    const getData = async () => {
      const seconds = (await contract.timeUntilWithdrawal()).toNumber()
      setWithdrawalSeconds(seconds)

      const lastMinter = await contract.lastMinter()
      setLastMinter(lastMinter)

      const amount = await contract.withdrawalAmount()
      setWithdrawalAmount(
        parseFloat(ethers.utils.formatEther(amount)).toFixed(1),
      )
    }

    getData()
  }, [contract])

  if (withdrawalSeconds === null) return null

  return (
    <MainWrapper>
      {withdrawalSeconds > 0 && (
        <CenterBox>
          <Typography variant="h4" component="span">
            WITHDRAWAL
          </Typography>
          &nbsp;
          <Typography variant="h4" component="span" color="primary">
            OPENS IN
          </Typography>
        </CenterBox>
      )}
      <Box mt={3}>
        <Grid container spacing={4}>
          {withdrawalSeconds > 0 && (
            <Grid item xs={12} sm={12} md={6}>
              <Box mb={2}>
                <Countdown
                  date={Date.now() + withdrawalSeconds * 1000}
                  renderer={Counter}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sm={12} md={6}>
            <Box>
              <Typography variant="body1" color="primary">
                Last Minter Address
              </Typography>
              <Typography variant="body2">
                <StyledLink href={`/gallery?address=${lastMinter}`}>
                  {lastMinter}
                </StyledLink>
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="body1" color="primary">
                Withdrawal Date
              </Typography>
              <Typography variant="body2">
                {moment().add(withdrawalSeconds, 'seconds').format('llll')}
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="body1" color="primary">
                Withdrawal Amount
              </Typography>
              <Typography variant="body2">{withdrawalAmount}Ξ</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Paper>
        <Box my={4} p={3}>
          <Typography variant="body2" style={{ lineHeight: 2 }}>
            If nobody mints for 30 days after the last mint, the last minter can
            withdraw 50% of all the ETH that was spent on minting up to that
            point. In this way, ETH spent on minting goes to the minters, not
            the creators of Random Walk NFT.
          </Typography>
        </Box>
      </Paper>
      <Button
        onClick={handleWithdraw}
        color="primary"
        variant="contained"
        size="large"
      >
        Withdraw Now
      </Button>
    </MainWrapper>
  )
}

export default Redeem

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography } from '@mui/material'
import TradingHistory from '../components/TradingHistory'
import { MainWrapper } from '../components/styled'
import api from '../services/api'

const Trading = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tradingHistory, setTradingHistory] = useState(true)
  useEffect(() => {
    const getHistory = async () => {
      const tradingHistory = await api.tradingHistory()
      setTradingHistory(tradingHistory)
      setLoading(false);
    }
    getHistory()
  }, [])

  return (
    <MainWrapper>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="h4" component="span">
          RANDOM
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="primary"
          sx={{ ml: 1.5 }}
        >
          WALK
        </Typography>
        <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
          NFT
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="secondary"
          sx={{ ml: 1.5 }}
        >
          TRADING HISTORY
        </Typography>
      </Box>
      <TradingHistory loading={loading} tradingHistory={tradingHistory} />
    </MainWrapper>
  )
}

export default Trading

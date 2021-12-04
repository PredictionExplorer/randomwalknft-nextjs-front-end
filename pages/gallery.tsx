import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography } from '@mui/material'

import PaginationGrid from '../components/PaginationGrid'
import { MainWrapper } from '../components/styled'

import useNFTContract from '../hooks/useNFTContract'

const Gallery = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState([])
  const [address, setAddress] = useState(null)

  const contract = useNFTContract()

  useEffect(() => {
    const address = router.query['address'] as string

    const getTokens = async () => {
      try {
        setLoading(true)
        let tokenIds = []
        if (address) {
          const tokens = await contract.walletOfOwner(address)
          tokenIds = tokens.map((t) => t.toNumber()).reverse()
        } else {
          const balance = await contract.totalSupply()
          tokenIds = Object.keys(new Array(balance.toNumber()).fill(0))
          tokenIds = tokenIds.reverse()
        }

        setAddress(address)
        setCollection(tokenIds)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    }

    getTokens()

    return () => {
      setCollection([])
      setLoading(false)
    }
  }, [contract, router])

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
          GALLERY
        </Typography>
      </Box>
      {address && (
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          Owned by {address}
        </Typography>
      )}
      <PaginationGrid loading={loading} data={collection} />
    </MainWrapper>
  )
}

export default Gallery

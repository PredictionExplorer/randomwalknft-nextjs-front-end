import React, { useState, useEffect } from 'react'
import { Box, Typography, Drawer, ListItem } from '@mui/material'
import { NavLink, DrawerList } from '../components/styled'
import { ethers } from 'ethers'

import PaginationOfferGrid from '../components/PaginationOfferGrid'
import { MainWrapper } from '../components/styled'
import { getOfferById } from '../hooks/useOffer'
import useNFTContract from '../hooks/useNFTContract'
import useMarketContract from '../hooks/useMarketContract'

const Marketplace = () => {
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState([])
  
  const [drawerOpen, toggleDrawerOpen] = useState(false)

  const nftContract = useNFTContract()
  const marketContract = useMarketContract()

  useEffect(() => {
    const getTokens = async () => {
      try {
        setLoading(true)
        const numOffers = await marketContract.numOffers()
        const offerIds = Object.keys(new Array(numOffers.toNumber()).fill(0))
        let offers = await Promise.all(
          offerIds.map((offerId) =>
            getOfferById(nftContract, marketContract, offerId),
          ),
        )
        const zeroAddress = ethers.constants.AddressZero
        offers = offers
          .filter(
            (offer) => offer && offer.active && offer.buyer === zeroAddress,
          )
          .sort((x, y) => x.price - y.price)
        setCollection(offers)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    }

    getTokens()
  }, [nftContract, marketContract])

  const handleDrawerClose = () => toggleDrawerOpen(!drawerOpen)

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
          NFTS
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="secondary"
          sx={{ ml: 1.5 }}
        >
          MARKETPLACE
        </Typography>
      </Box>
      <PaginationOfferGrid loading={loading} data={collection} />
    </MainWrapper>
  )
}

export default Marketplace

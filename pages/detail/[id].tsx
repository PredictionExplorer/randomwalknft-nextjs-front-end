import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'

import { Box, Divider, ToggleButton, ToggleButtonGroup, Alert } from '@mui/material'

import NFTTrait from '../../components/NFTTrait'
import NFTBuyOffers from '../../components/NFTBuyOffers'
import { MainWrapper } from '../../components/styled'

import { useBuyOfferIds, useSellTokenIds } from '../../hooks/useOffer'
import { useActiveWeb3React } from '../../hooks/web3'

import api from '../../services/api'

const Detail = ({ nft }) => {
  const router = useRouter()
  const { seller } = router.query
  const buyOffers = useBuyOfferIds(nft.id)
  const { account } = useActiveWeb3React()
  const sellTokenIds = useSellTokenIds(account)
  const [darkTheme, setDarkTheme] = useState(true)

  useEffect(() => {
    let hash = router.asPath.match(/#([a-z0-9]+)/gi)
    const darkModes = [
      '#black_image',
      '#black_single_video',
      '#black_triple_video',
    ]
    const lightModes = [
      '#white_image',
      '#white_single_video',
      '#white_triple_video',
    ]
    if (darkModes.includes(hash[0])) {
      setDarkTheme(true)
    } else if (lightModes.includes(hash[0])) {
      setDarkTheme(false)
    }
  }, [router])

  if (!nft) return <></>

  return (
    <MainWrapper
      maxWidth={false}
      style={{
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      {router.query && router.query.message && (
        <Box px={8} mb={2}>
          <Alert variant="outlined" severity="success">
            {router.query.message}
          </Alert>
        </Box>
      )}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ position: 'relative', height: 60 }}
      >
        <Divider style={{ background: '#121212', width: '100%' }} />
        <ToggleButtonGroup
          value={darkTheme}
          exclusive
          onChange={() => setDarkTheme(!darkTheme)}
          style={{ position: 'absolute' }}
        >
          <ToggleButton value={true}>Dark theme</ToggleButton>
          <ToggleButton value={false}>White theme</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <NFTTrait nft={nft} darkTheme={darkTheme} seller={seller} />
      <NFTBuyOffers
        offers={buyOffers}
        nft={nft}
        account={account}
        sellTokenIds={sellTokenIds}
      />
    </MainWrapper>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id
  const tokenId = Array.isArray(id) ? id[0] : id
  const nft = await api.get(tokenId)
  return {
    props: { nft },
  }
}

export default Detail

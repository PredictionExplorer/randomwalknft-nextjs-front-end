import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import React, { useState, useEffect } from 'react'

import { Box, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material'

import NFTTrait from '../../components/NFTTrait'
import NFTBuyOffers from '../../components/NFTBuyOffers'
import { MainWrapper } from '../../components/styled'

import { useBuyOfferIds, useSellTokenIds } from '../../hooks/useOffer'
import { useActiveWeb3React } from '../../hooks/web3'

import api from '../../services/api'

import { formatId } from '../../utils'

const Detail = ({ nft }) => {
  const router = useRouter()
  const { seller } = router.query
  const buyOffers = useBuyOfferIds(nft.id)
  const { account } = useActiveWeb3React()
  const sellTokenIds = useSellTokenIds(account)
  const [darkTheme, setDarkTheme] = useState(true)

  useEffect(() => {
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
    if (darkModes.includes(location.hash)) {
      setDarkTheme(true)
    } else if (lightModes.includes(location.hash)) {
      setDarkTheme(false)
    }
  }, [location])

  if (!nft) return <></>

  return (
    <>
      <Head>
        <title>Random Walk NFT {formatId(nft.id)}</title>
        <meta
          name="description"
          content={`These are the details for Random Walk NFT ${formatId(
            nft.id,
          )}`}
        />
        <meta
          property="og:title"
          key="ogTitle"
          content="CryptoPunks: Details for Punk #5347"
        />
        <meta
          property="og:image"
          key="ogImage"
          content="https://www.larvalabs.com/cryptopunks/cryptopunk5347.png?customColor=638596"
        />
        <meta
          property="og:description"
          key="ogDescription"
          content="CryptoPunks are 10,000 collectible characters on the Ethereum blockchain. These are the details for Punk #5347"
        />

        <meta name="twitter:card" key="twitterCard" content="summary" />
        <meta
          name="twitter:title"
          key="twitterTitle"
          content="CryptoPunks: Details for Punk #5347"
        />
        <meta
          name="twitter:image"
          key="twitterImage"
          content="https://www.larvalabs.com/cryptopunks/cryptopunk5347.png?customColor=638596"
        />
        <meta
          name="twitter:description"
          key="twitterDescription"
          content="CryptoPunks are 10,000 collectible characters on the Ethereum blockchain. These are the details for Punk #5347"
        />
      </Head>
      <MainWrapper
        maxWidth={false}
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {/* {location.state && location.state.message && (
        <Box px={8} mb={2}>
          <Alert variant="outlined" severity="success">
            {location.state.message}
          </Alert>
        </Box>
      )} */}
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
    </>
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

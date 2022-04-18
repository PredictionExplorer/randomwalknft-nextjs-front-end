import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Web3ReactProvider } from '@web3-react/core'

const Web3ProviderNetwork = dynamic(
  () => import('../components/Web3ProviderNetwork'),
  { ssr: false },
)

import Web3ReactManager from '../components/Web3ReactManager'
import Header from '../components/Header'
import Footer from '../components/Footer'

import createEmotionCache from '../cache/createEmotionCache'
import getLibrary from '../utils/getLibrary'
import theme from '../config/styles'
import { formatId } from '../utils'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/neat.css'
import '../styles/global.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as ga from '../utils/analytics'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
  const canonicalUrl = (`https://www.randomwalknft.com` + (router.asPath === "/" ? "": router.asPath)).split("?")[0];
  return (
    <>
      <Head>
        {pageProps.title ? 
          <title>{pageProps.title} | Random Walk NFT</title> : 
          <title>Random Walk NFT</title>
        }
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <meta
          name="google-site-verification"
          content="ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE"
        />
        <meta
          name="description"
          content={pageProps.description + "Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."}
        />
        <link rel="canonical" href={canonicalUrl} />
        {pageProps.nft && (
          <>
            <meta
              property="og:title"
              content={`Random Walk NFT: Details for ${formatId(
                pageProps.nft.id,
              )}`}
            />
            <meta property="og:image" content={pageProps.nft.black_image_url} />
            <meta
              property="og:description"
              content={`Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters. These are the details for ${formatId(
                pageProps.nft.id,
              )}`}
            />

            <meta name="twitter:card" content="summary" />
            <meta
              name="twitter:title"
              content={`Random Walk NFT: Details for ${formatId(
                pageProps.nft.id,
              )}`}
            />
            <meta
              name="twitter:image"
              content={pageProps.nft.black_image_url}
            />
            <meta
              name="twitter:description"
              content={`Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters. These are the details for ${formatId(
                pageProps.nft.id,
              )}`}
            />
          </>
        )}
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Web3ReactManager>
                <>
                  <Header />
                  <Component {...pageProps} />
                  <Footer />
                </>
              </Web3ReactManager>
            </ThemeProvider>
          </CacheProvider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </>
  )
}

export default MyApp

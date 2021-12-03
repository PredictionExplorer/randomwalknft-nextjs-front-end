import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
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

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/neat.css'
import '../styles/global.css'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
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
  )
}

export default MyApp

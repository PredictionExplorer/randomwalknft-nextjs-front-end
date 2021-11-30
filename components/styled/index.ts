import * as React from 'react'
import {
  Box,
  Link,
  AppBar,
  List,
  Chip,
  Container,
  Button,
  Accordion,
  CardMedia,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { isMobile } from 'react-device-detect'

export const NavLink = styled(Link)({
  color: '#fff',
  textDecoration: 'none',
  textTransform: 'uppercase',
  ':hover': {
    textDecoration: 'underline',
  },
})

export const AppBarWrapper = styled(AppBar)(({ theme }) => ({
  background: '#000',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}))

export const FooterWrapper = styled(AppBar)({
  top: 'auto',
  bottom: 0,
  background: '#200C31',
})

export const DrawerList = styled(List)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  width: 265,
  height: '100%',
  backgroundColor: '#200C31',
  borderLeft: '1px solid #F4BFFF',
}))

export const Wallet = styled(Chip)(({ theme }) => ({
  padding: theme.spacing(1),
  height: 'auto',
  marginLeft: 'auto',
  fontSize: 16,
}))

export const MobileWallet = styled(Wallet)({
  margin: '0 auto',
})

export const MainWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(28),
  paddingBottom: theme.spacing(24),
  overflow: 'hidden',
  lineHeight: 1,
  [theme.breakpoints.down('sm')]: {
    textAlign: 'center',
    paddingTop: theme.spacing(18),
    paddingBottom: theme.spacing(18),
  },
}))

export const CenterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
  },
}))

export const MintButton = styled(Button)({
  width: 128,
  height: 128,
  borderRadius: '100%',
  border: '1px solid #fff',
  color: '#fff',
})

export const MintActiveButton = styled(MintButton)({
  border: '1px solid #F4BFFF',
  backgroundColor: '#303030',
})

export const CounterWrapper = styled(Box)({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: isMobile ? 'center' : 'space-between',
  alignItems: 'center',
})

export const CounterItem = styled(Box)({
  width: isMobile ? '80%' : '20%',
  padding: '8px 0',
  border: '2px solid #F4BFFF',
  boxSizing: 'border-box',
  boxShadow: '0px 0px 10px #C676D7',
  marginBottom: isMobile ? 24 : 0,
})

export const QuestionIcon = styled('img')({
  marginRight: '0.5rem',
})

export const FaqAccordion = styled(Accordion)({
  border: '1px solid #F4BFFF',
  marginBottom: 16,
  padding: '12px 16px',
})

export const NFTImage = styled(CardMedia)({
  width: '100%',
  paddingTop: '64%',
})

export const NFTInfoWrapper = styled('div')({
  position: 'absolute',
  top: 20,
  right: 24,
})

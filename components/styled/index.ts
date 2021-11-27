import * as React from 'react'
import { Box, Link, AppBar, List, Chip, Container, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

export const NavLink = styled(Link)({
  color: '#fff',
  textDecoration: 'none',
  textTransform: 'uppercase',
})

export const AppBarWrapper = styled(AppBar)(({ theme }) => ({
  background: '#000',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}))

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

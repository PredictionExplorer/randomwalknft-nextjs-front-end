import { createTheme } from '@mui/material/styles'

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#C676D7',
    },
    secondary: {
      main: '#F4BFFF',
    },
    info: {
      main: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C676D7',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
  },
  typography: {
    fontFamily: 'Kelson Sans',
    fontSize: 16,
  },
})

export default theme

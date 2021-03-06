import React from 'react'

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Container,
  Typography,
  Link,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons'

import { FooterWrapper } from './styled'

const Footer = () => (
  <FooterWrapper position="fixed" color="primary">
    <Toolbar>
      <Container maxWidth="lg">
        <Box py={1} display="flex" justifyContent="center" alignItems="center">
          <Box mr={2}>
            <Typography variant="body2" component="p">
              <Typography
                variant="body2"
                component="span"
                color="textSecondary"
              >
                Member of the
              </Typography>
              &nbsp;
              <Link
                color="textSecondary"
                target="_blank"
                href={`https://www.nftalliance.xyz`}
                style={{ textDecoration: 'underline' }}
              >
                Arbitrum NFT Alliance
              </Link>
            </Typography>
          </Box>
          <IconButton href="https://twitter.com/RandomWalkNFT" target="_blank">
            <FontAwesomeIcon icon={faTwitter} size="xs" color="#C676D7" />
          </IconButton>
          <IconButton href="https://discord.gg/bGnPn96Qwt" target="_blank">
            <FontAwesomeIcon icon={faDiscord} size="xs" color="#C676D7" />
          </IconButton>
        </Box>
      </Container>
    </Toolbar>
  </FooterWrapper>
)

export default Footer

import React, { useState } from 'react'

import {
  Box,
  Paper,
  Typography,
  Grid,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import { MainWrapper, FaqAccordion, QuestionIcon } from '../components/styled'

const FAQ = () => {
  const items = [
    {
      summary: 'How do I mint Random Walk NFTs?',
      detail:
        "You need the <a style='color: #fff' href='https://metamask.io'>MetaMask</a> extension installed in your browser and enough ETH on Arbitrum to mint the next NFT. " +
        "You can transfer ETH from Ethereum to Arbitrum using <a style='color: #fff' href='https://hop.exchange'>Hop</a>, " +
        "<a style='color: #fff' href='https://bridge.arbitrum.io'>Arbitrum Bridge</a> or you can withdraw from an exchange directly to Arbitrum using <a style='color: #fff' href='https://www.layerswap.io'>LayerSwap</a>.",
    },
    {
      summary: 'How do I add Arbitrum to my MetaMask?',
      detail:
        "Check out this <a style='color: #fff' href='https://help.uniswap.org/en/articles/5538707-how-to-connect-to-arbitrum'>simple guide</a>.",
    },
    {
      summary: 'How many Random Walk NFTs will there be?',
      detail:
        'Every time an NFT is minted, the price of the next mint increases by about 0.1%. After 5,000 NFTs are minted, the mint price would be 0.24 ETH. After 10,000 NFTs are minted, the mint price would be about 60 ETH. ' +
        "Given the exponential increase in price, it's hard to imagine more than a few thousand NFTs being minted.",
    },
    {
      summary: 'Where does the ETH go that people paid for minting?',
      detail:
        'We are doing a social experiment with it! ' +
        "After there hasn't been a mint for 30 days, the last minter can withdraw half of all the ETH spend on minting up to that point. " +
        'The other half stays in the contract and is distributed using the same mechanism. For example, suppose Minter A is the last minter and 100 ETH has been spent minting up to that point. ' +
        'There is no mint for 30 days and Minter A withdraws 50 ETH. Minter B now mints and there is no mint for 30 days. Minter B can now withdraw 25 ETH. Note that it would take many withdrawal events ' +
        'for all the ETH in the contract to be claimed.',
    },
    {
      summary: 'Are the contracts verified on Etherscan?',
      detail:
        "Check out this <a style='color: #fff' href='https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b#code'>NFT Contract</a>, " +
        "and this <a style='color: #fff' href='https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08#code'>Market Contract</a>.",
    },
    {
      summary: 'What is the fee for using the market to buy and sell NFTs?',
      detail: "It's free! The fee is 0%!",
    },
    {
      summary: 'How are the NFT images generated?',
      detail:
        'When you mint, a random number (called a seed) is generated for each NFT by the smart contract. We use the seed in the Python script to generate an image and videos.',
    },
    {
      summary: 'What is a Random Walk?',
      detail:
        'Imagine you are standing on a 2D plane. You can take a step in one of the 4 directions (forward, back, left, right). Imagine you decide the direction of your step randomly. ' +
        'If you do this a few million times and plot it you will you will get images that look like Random Walk NFTs.',
    },
    {
      summary: 'How are the colors generated?',
      detail:
        'By doing a random walk in color space! At each step we modify the value of red, blue and green. This means we are actually doing a random walk in a 5 dimensional space (2 spatial dimensions and 3 color dimensions).',
    },
    {
      summary: 'Does the creator of the NFT get any special privileges?',
      detail:
        'No, once the contract is deployed, nobody has any special privileges. The creator of the NFT has to buy the NFTs like everybody else, and does not get any ETH spent on minting. ' +
        'Instead, the ETH is distributed to some of the minters as described above. ' +
        'This is inspired by how Satoshi launched Bitcoin. He did not give himself any special privileges and had to mine the coin like everybody else.',
    },
  ]

  const [expanded, setExpanded] = useState(null)

  const handleChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : false)
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="secondary" gutterBottom>
        FAQ
      </Typography>
      <Typography variant="body1" gutterBottom>
        Get answers to the most common questions
      </Typography>
      <Box mt={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={8}>
            {items.map(({ summary, detail }, i) => (
              <FaqAccordion
                key={i}
                expanded={expanded === i}
                onChange={handleChange(i)}
              >
                <AccordionSummary
                  expandIcon={
                    expanded === i ? (
                      <RemoveIcon color="primary" fontSize="small" />
                    ) : (
                      <AddIcon color="primary" fontSize="small" />
                    )
                  }
                >
                  <Box display="flex" alignItems="center">
                    <QuestionIcon src="images/question.svg" />
                    <Typography variant="body2">{summary}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    align="left"
                    dangerouslySetInnerHTML={{ __html: detail }}
                  />
                </AccordionDetails>
              </FaqAccordion>
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Paper>
              <Box p={4}>
                <Typography variant="h5" gutterBottom>
                  Have a question?
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  style={{ lineHeight: 2 }}
                >
                  For any other questions, reach out to us on&nbsp;
                  <Link
                    color="primary"
                    style={{ textDecoration: 'underline' }}
                    href="https://twitter.com/RandomWalkNFT"
                  >
                    Twitter
                  </Link>
                  &nbsp;or&nbsp;
                  <Link
                    color="primary"
                    style={{ textDecoration: 'underline' }}
                    href="https://discord.gg/bGnPn96Qwt"
                  >
                    Discord
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainWrapper>
  )
}

export default FAQ

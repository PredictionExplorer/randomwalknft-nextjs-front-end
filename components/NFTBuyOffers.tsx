import React from 'react'
import { ethers } from 'ethers'
import {
  Box,
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material'

import { useOffer } from '../hooks/useOffer'
import useMarketContract from '../hooks/useMarketContract'

import { SectionWrapper, TablePrimaryContainer } from './styled'

const OfferRow = ({ offerId, isOwner, account }) => {
  const offer = useOffer(offerId)
  const contract = useMarketContract()

  const handleAcceptBuy = async () => {
    try {
      await contract.acceptBuyOffer(offerId).then((tx) => tx.wait())
      window.location.reload()
    } catch (err) {
      console.log(err)
    }
  }

  const handleCancelBuy = async () => {
    try {
      await contract.cancelBuyOffer(offerId).then((tx) => tx.wait())
      window.location.reload()
    } catch (err) {
      console.log(err)
    }
  }

  if (!offer) {
    return <TableRow></TableRow>
  }

  return (
    <TableRow>
      <TableCell>{offer.id}</TableCell>
      <TableCell>{offer.buyer}</TableCell>
      <TableCell>{offer.price.toFixed(4)}Ξ</TableCell>
      {account ? (
        <TableCell>
          {(isOwner && offer.buyer.toLowerCase() !== account.toLowerCase()) ||
          offer.seller.toLowerCase() === account.toLowerCase() ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAcceptBuy}
            >
              Accept
            </Button>
          ) : (
            offer.buyer.toLowerCase() === account.toLowerCase() && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCancelBuy}
              >
                Cancel
              </Button>
            )
          )}
        </TableCell>
      ) : (
        <TableCell></TableCell>
      )}
    </TableRow>
  )
}

const OfferTable = ({ offers, isOwner, account }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>Price</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.length > 0 ? (
            offers.map((id, i) => (
              <OfferRow
                offerId={id}
                key={i}
                isOwner={isOwner}
                account={account}
              />
            ))
          ) : (
            <TableRow>
              <TableCell align="center" colSpan={4}>
                No offers yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  )
}

const NFTBuyOffers = ({ offers, nft, account, sellTokenIds }) => (
  <SectionWrapper>
    <Container>
      <Box mb={4}>
        <Typography variant="h4">
          <Typography variant="h4" component="span">
            BUY
          </Typography>
          &nbsp;
          <Typography variant="h4" component="span" color="secondary">
            OFFERS
          </Typography>
        </Typography>
      </Box>
      <OfferTable
        offers={offers}
        isOwner={
          (account && nft.owner.toLowerCase() === account.toLowerCase()) ||
          sellTokenIds.includes(nft.id)
        }
        account={account}
      />
    </Container>
  </SectionWrapper>
)

export default NFTBuyOffers

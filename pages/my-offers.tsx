import React from 'react'
import { ethers } from 'ethers'

import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Link,
} from '@mui/material'

import {
  useAccountBuyOfferIds,
  useAccountSellOfferIds,
  useOffer,
} from '../hooks/useOffer'
import { useActiveWeb3React } from '../hooks/web3'
import useMarketContract from '../hooks/useMarketContract'

import { formatId } from '../utils'
import { MainWrapper, TablePrimaryContainer } from '../components/styled'

const OfferRow = ({ offerId }) => {
  const offer = useOffer(offerId)
  const contract = useMarketContract()

  if (!offer) {
    return <TableRow></TableRow>
  }

  const isBuy = offer.buyer !== ethers.constants.AddressZero

  const handleCancel = async () => {
    try {
      if (isBuy) {
        await contract.cancelBuyOffer(offerId).then((tx) => tx.wait())
      } else {
        await contract.cancelSellOffer(offerId).then((tx) => tx.wait())
      }
      window.location.reload()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TableRow>
      <TableCell>{isBuy ? 'BUY' : 'SELL'}</TableCell>
      <TableCell>
        <Link style={{ color: '#fff' }} href={`/detail/${offer.tokenId}`}>
          {offer.tokenName || formatId(offer.tokenId)}
        </Link>
      </TableCell>
      <TableCell>{offer.price.toFixed(4)}Ξ</TableCell>
      <TableCell align="right">
        <Button variant="contained" color="primary" onClick={handleCancel}>
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  )
}

const OfferTable = ({ offers }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Token</TableCell>
            <TableCell>Price</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.length > 0 ? (
            offers.map((id, i) => <OfferRow offerId={id} key={i} />)
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No offers yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  )
}

const MyOffers = () => {
  const { account } = useActiveWeb3React()

  const buyOffers = useAccountBuyOfferIds(account)
  const sellOffers = useAccountSellOfferIds(account)
  const offers = buyOffers.concat(sellOffers).sort((x, y) => x - y)

  return account ? (
    <MainWrapper>
      <Typography color="primary" variant="h4" gutterBottom align="center">
        MY OFFERS
      </Typography>
      <OfferTable offers={offers} />
    </MainWrapper>
  ) : null
}

export default MyOffers

import React from "react";
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
} from "@mui/material";

import useMarketContract from "../hooks/useMarketContract";

import { SectionWrapper, TablePrimaryContainer } from "./styled";

const OfferRow = ({ offer, isOwner, account }) => {
  const contract = useMarketContract();

  const handleAcceptBuy = async () => {
    try {
      await contract.acceptBuyOffer(offer.OfferId).then((tx) => tx.wait());
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelBuy = async () => {
    try {
      await contract.cancelBuyOffer(offer.OfferId).then((tx) => tx.wait());
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  if (!offer) {
    return <TableRow></TableRow>;
  }

  return (
    <TableRow>
      <TableCell>{offer.OfferId}</TableCell>
      <TableCell>{offer.BuyerAddr}</TableCell>
      <TableCell>{offer.Price.toFixed(4)}Ξ</TableCell>
      {account ? (
        <TableCell>
          {(isOwner &&
            offer.BuyerAddr.toLowerCase() !== account.toLowerCase()) ||
          offer.SellerAddr.toLowerCase() === account.toLowerCase() ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAcceptBuy}
            >
              Accept
            </Button>
          ) : (
            offer.BuyerAddr.toLowerCase() === account.toLowerCase() && (
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
  );
};

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
            offers.map((offer, i) => (
              <OfferRow
                offer={offer}
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
  );
};

const NFTBuyOffers = ({ offers, nft, account, userSellOffers }) => (
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
          userSellOffers.length
        }
        account={account}
      />
    </Container>
  </SectionWrapper>
);

export default NFTBuyOffers;

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
} from "@mui/material";

import { useOffer } from "../hooks/useOffer";
import { SectionWrapper, TablePrimaryContainer } from "./styled";

const OfferRow = ({ offerId }) => {
  console.log(parseInt(offerId))
  const offer = useOffer(parseInt(offerId));

  if (!offer) {
    return <TableRow></TableRow>;
  }

  return (
    <TableRow>
      <TableCell>{offer.id}</TableCell>
      <TableCell>{offer.seller}</TableCell>
      <TableCell>{offer.buyer}</TableCell>
      <TableCell>{offer.price.toFixed(4)}Ξ</TableCell>
    </TableRow>
  );
};

const OfferTable = ({ offers }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.length > 0 ? (
            offers.map((offer, i) => (
              <OfferRow offerId={offer.args.offerId} key={i} />
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

const NFTSalesHistory = ({ data }) => {
  return (
    <SectionWrapper>
      <Container>
        <Box mb={4}>
          <Typography variant="h4">
            <Typography variant="h4" component="span">
              SALES
            </Typography>
            &nbsp;
            <Typography variant="h4" component="span" color="secondary">
              STATISTICS
            </Typography>
          </Typography>
        </Box>
        <OfferTable offers={data} />
      </Container>
    </SectionWrapper>
  );
};

export default NFTSalesHistory;

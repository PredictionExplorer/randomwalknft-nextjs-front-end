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
  Link,
} from "@mui/material";

import { SectionWrapper, TablePrimaryContainer } from "./styled";

const HistoryRow = ({ history }) => {
  const eventTypes = [
    "",
    "Mint",
    "New Offer",
    "Cancel Offer",
    "Item Bought",
    "Token Name",
    "Transfer",
  ];

  const convertTimestampToDateTime = (timestamp: any) => {
    var date_ob = new Date(timestamp * 1000);
    var year = date_ob.getFullYear();
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var date = ("0" + date_ob.getDate()).slice(-2);
    var hours = ("0" + date_ob.getHours()).slice(-2);
    var minutes = ("0" + date_ob.getMinutes()).slice(-2);
    var seconds = ("0" + date_ob.getSeconds()).slice(-2);
    var result =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;
    return result;
  };

  const ellipsisAddress = (address: string) => {
    if (address === undefined) return "";
    return address.slice(0, 16) + "..." + address.slice(-4);
  };

  if (!history) {
    return <TableRow></TableRow>;
  }

  return (
    <TableRow>
      <TableCell>{history.Record?.BlockNum}</TableCell>
      <TableCell>
        {convertTimestampToDateTime(history.Record?.TimeStamp)}
      </TableCell>
      <TableCell>
        <Link
          href={`/gallery?address=${history.Record?.OwnerAddr}`}
          style={{ color: "#fff" }}
        >
          {ellipsisAddress(history.Record?.OwnerAddr)}
        </Link>
      </TableCell>
      <TableCell>
        {history.RecordType == 2 ? (
          <Link
            href={`/gallery?address=${history.Record?.SellerAddr}`}
            style={{ color: "#fff" }}
          >
            {ellipsisAddress(history.Record?.SellerAddr)}
          </Link>
        ) : (
          <Link
            href={`/gallery?address=${history.Record?.FromAddr}`}
            style={{ color: "#fff" }}
          >
            {ellipsisAddress(history.Record?.FromAddr)}
          </Link>
        )}
      </TableCell>
      <TableCell>
        {history.RecordType == 2 ? (
          <Link
            href={`/gallery?address=${history.Record?.BuyerAddr}`}
            style={{ color: "#fff" }}
          >
            {ellipsisAddress(history.Record?.BuyerAddr)}
          </Link>
        ) : (
          <Link
            href={`/gallery?address=${history.Record?.ToAddr}`}
            style={{ color: "#fff" }}
          >
            {ellipsisAddress(history.Record?.ToAddr)}
          </Link>
        )}
      </TableCell>
      <TableCell>{history.Record?.Price}</TableCell>
      <TableCell>{eventTypes[history.RecordType]}</TableCell>
    </TableRow>
  );
};

const HistoryTable = ({ tokenHistory }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Block</TableCell>
            <TableCell>Datetime</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>From (Seller)</TableCell>
            <TableCell>To (Buyer)</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Event</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokenHistory.length > 0 ? (
            tokenHistory.map((history, i) => (
              <HistoryRow history={history} key={i} />
            ))
          ) : (
            <TableRow>
              <TableCell align="center" colSpan={4}>
                No history yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  );
};

const NFTHistory = ({ tokenHistory }) => (
  <SectionWrapper>
    <Container>
      <Box mb={4}>
        <Typography variant="h4">
          <Typography variant="h4" component="span">
            TOKEN
          </Typography>
          &nbsp;
          <Typography variant="h4" component="span" color="secondary">
            HISTORY
          </Typography>
        </Typography>
      </Box>
      <HistoryTable tokenHistory={tokenHistory} />
    </Container>
  </SectionWrapper>
);

export default NFTHistory;

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
import { useTokenPrice } from "../hooks/useTokenInfo";

const HistoryRow = ({ history }) => {
  const ethPrice = useTokenPrice();
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
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var date_ob = new Date(timestamp * 1000);
    var year = date_ob.getFullYear();
    var month = date_ob.getMonth();
    var date = ("0" + date_ob.getDate()).slice(-2);

    var result = months[month] + " " + date + ", " + year;
    return result;
  };

  if (!history) {
    return <TableRow></TableRow>;
  }

  return (
    <TableRow>
      <TableCell>{eventTypes[history.RecordType]}</TableCell>
      <TableCell>
        {history.RecordType == 2 || history.RecordType == 4 ? (
          <Link
            href={`/gallery?address=${history.Record?.SellerAddr}`}
            style={{ color: "#fff" }}
          >
            {history.Record?.SellerAddr}
          </Link>
        ) : (
          <Link
            href={`/gallery?address=${history.Record?.FromAddr}`}
            style={{ color: "#fff" }}
          >
            {history.Record?.FromAddr}
          </Link>
        )}
      </TableCell>
      <TableCell>
        {history.RecordType == 1 ? (
          <Link
            href={`/gallery?address=${history.Record?.OwnerAddr}`}
            style={{ color: "#fff" }}
          >
            {history.Record?.OwnerAddr}
          </Link>
        ) : history.RecordType == 2 || history.RecordType == 4 ? (
          <Link
            href={`/gallery?address=${history.Record?.BuyerAddr}`}
            style={{ color: "#fff" }}
          >
            {history.Record?.BuyerAddr}
          </Link>
        ) : (
          <Link
            href={`/gallery?address=${history.Record?.ToAddr}`}
            style={{ color: "#fff" }}
          >
            {history.Record?.ToAddr}
          </Link>
        )}
      </TableCell>
      <TableCell>
        {history.Record?.Price &&
          `${history.Record?.Price?.toFixed(2)}Ξ ($${(
            history.Record?.Price * ethPrice
          ).toFixed(2)})`}
      </TableCell>
      <TableCell>
        {convertTimestampToDateTime(history.Record?.TimeStamp)}
      </TableCell>
    </TableRow>
  );
};

const HistoryTable = ({ tokenHistory }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Txn</TableCell>
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

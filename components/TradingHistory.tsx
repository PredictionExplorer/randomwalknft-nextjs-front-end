import React from "react";
import {
  Box,
  Container,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Link,
  CircularProgress,
} from "@mui/material";
import { SectionWrapper, TablePrimaryContainer, TablePrimaryCell } from "./styled";
import { useTokenPrice } from "../hooks/useTokenInfo";

const HistoryRow = ({ history }) => {
  const ethPrice = useTokenPrice();

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
      <TablePrimaryCell>{convertTimestampToDateTime(history.TimeStamp)}</TablePrimaryCell>
      <TablePrimaryCell>
        {history.Price &&
          `${history.Price?.toFixed(3)}Ξ ($${(history.Price * ethPrice).toFixed(
            3
          )})`}
      </TablePrimaryCell>
      <TablePrimaryCell>{history.TokenId}</TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/gallery?address=${history.BuyerAddr}`}
          style={{ color: "#fff" }}
        >
          {history.BuyerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/gallery?address=${history.SellerAddr}`}
          style={{ color: "#fff" }}
        >
          {history.SellerAddr}
        </Link>
      </TablePrimaryCell>
    </TableRow>
  );
};

const HistoryTable = ({ tradingHistory }) => {
  return (
    <TablePrimaryContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TablePrimaryCell>Date</TablePrimaryCell>
            <TablePrimaryCell>Price</TablePrimaryCell>
            <TablePrimaryCell>NFT#</TablePrimaryCell>
            <TablePrimaryCell>Buyer</TablePrimaryCell>
            <TablePrimaryCell>Seller</TablePrimaryCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tradingHistory.length > 0 ? (
            tradingHistory.map((history, i) => (
              <HistoryRow history={history} key={i} />
            ))
          ) : (
            <TableRow>
              <TablePrimaryCell align="center" colSpan={4}>
                No history yet.
              </TablePrimaryCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  );
};

const TradingHistory = ({ loading, tradingHistory }) => (
  <SectionWrapper>
    <Container>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" />
        </Box>
      )}
      <HistoryTable tradingHistory={tradingHistory} />
    </Container>
  </SectionWrapper>
);

export default TradingHistory;

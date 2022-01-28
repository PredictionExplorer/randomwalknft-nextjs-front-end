import React from "react";
import { Box, Typography } from "@mui/material";
import TradingHistory from "../components/TradingHistory";
import { MainWrapper } from "../components/styled";
import api from "../services/api";

const Trading = ({ tradingHistory, totalCount, page }) => {
  return (
    <MainWrapper>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="h4" component="span">
          RANDOM
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="primary"
          sx={{ ml: 1.5 }}
        >
          WALK
        </Typography>
        <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
          NFT
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="secondary"
          sx={{ ml: 1.5 }}
        >
          TRADING HISTORY
        </Typography>
      </Box>
      <TradingHistory curPage={page} tradingHistory={tradingHistory} totalCount={totalCount} />
    </MainWrapper>
  );
};

export async function getServerSideProps(context) {
  const page = context.query.page ?? 1;
  const res = await api.tradingHistory(page);
  return {
    props: { tradingHistory: res.tradingHistory, totalCount: res.totalCount, page },
  };
}

export default Trading;

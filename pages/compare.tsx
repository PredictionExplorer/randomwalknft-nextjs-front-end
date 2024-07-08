import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import NFTTrait2 from "../components/NFTTrait2";
import api from "../services/api";

const Compare = () => {
  const [firstId, setFirstId] = useState(0);
  const [secondId, setSecondId] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const onSelectNFT = async (id: Number) => {
    if (processing) return;
    try {
      setProcessing(true);
      await api.add_game(firstId, secondId, id == firstId ? 1 : 0);
      await getToken();
      setProcessing(false);
    } catch (e) {
      console.log(e);
      setProcessing(false);
    }
  };

  const getToken = async () => {
    try {
      const tokenIds = await api.random();
      setFirstId(tokenIds[0]);
      setSecondId(tokenIds[1]);
      const res = await api.voteCount();
      setTotalCount(res.total_count);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  return (
    <>
      <Head>
        <title>Beauty Contest | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      <MainWrapper>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography variant="h4" component="span">
            WHICH
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            NFT
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            IS MORE BEAUTIFUL?
          </Typography>
        </Box>
        <Box mt={2}>{!!totalCount && `${totalCount} votes`}</Box>
        <Grid container mt={2} textAlign="center" justifyContent="center">
          <Grid item xs={12} sm={8} md={6} pt={4} pl={2} pr={2}>
            {!!firstId && (
              <NFTTrait2
                id={firstId}
                clickHandler={() => onSelectNFT(firstId)}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={8} md={6} pt={4} pl={2} pr={2}>
            {!!secondId && (
              <NFTTrait2
                id={secondId}
                clickHandler={() => onSelectNFT(secondId)}
              />
            )}
          </Grid>
        </Grid>
      </MainWrapper>
    </>
  );
};

export default Compare;

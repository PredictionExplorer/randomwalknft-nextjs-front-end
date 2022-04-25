import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import Head from "next/head";

import PaginationGrid from "../components/PaginationGrid";
import { MainWrapper } from "../components/styled";

import { useActiveWeb3React } from "../hooks/web3";
import useNFTContract from "../hooks/useNFTContract";

const MyNFTs = () => {
  const [loading, setLoading] = useState(true);
  const [nftIds, setNftIds] = useState([]);
  const { account } = useActiveWeb3React();
  const contract = useNFTContract();

  useEffect(() => {
    const getTokens = async () => {
      try {
        setLoading(true);
        const tokens = await contract.walletOfOwner(account);
        const nftIds = tokens.map((t) => t.toNumber()).reverse();
        setNftIds(nftIds);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    if (account) {
      getTokens();
    }
  }, [contract, account]);

  return (
    <>
      <Head>
        <title>My NFTs | Random Walk NFT</title>
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
          <Typography variant="h4" component="span" color="secondary">
            MY
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
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
            NFTS
          </Typography>
        </Box>
        <PaginationGrid loading={loading} data={nftIds} />
      </MainWrapper>
    </>
  );
};

export default MyNFTs;

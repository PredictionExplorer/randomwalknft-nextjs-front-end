import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { Typography, Box, Grid, CardActionArea, Hidden } from "@mui/material";
import Countdown from "react-countdown";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import Head from "next/head";

import { NFT_ADDRESS, MARKET_ADDRESS } from "../config/app";
import {
  MainWrapper,
  CenterBox,
  MintActiveButton,
  NFTImage,
  NFTInfoWrapper,
  StyledLink,
  StyledCard,
} from "../components/styled";
import Counter from "../components/Counter";

import useNFTContract from "../hooks/useNFTContract";
import useMarketContract from "../hooks/useMarketContract";

import api from "../services/api";
import { formatId, parseBalance } from "../utils";

const Mint = () => {
  const [saleSeconds, setSaleSeconds] = useState(null);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [mintPrice, setMintPrice] = useState("0");
  const [withdrawalAmount, setWithdrawalAmount] = useState("0");
  const [tokenIds, setTokenIds] = useState([]);

  const nftContract = useNFTContract();
  const marketContract = useMarketContract();

  const router = useRouter();

  const handleMint = async () => {
    if (nftContract) {
      try {
        if (saleSeconds > 0 && !countdownCompleted) {
          alert("The sale is not open yet.");
          return;
        }

        const mintPrice = await nftContract.getMintPrice();
        const newPrice = parseFloat(ethers.utils.formatEther(mintPrice)) * 1.01;

        const receipt = await nftContract
          .mint({ value: ethers.utils.parseEther(newPrice.toFixed(4)) })
          .then((tx) => tx.wait());

        const token_id = receipt.events[0].args.tokenId.toNumber();

        const task_id = await api.create(token_id);
        let delay = 2000;
        if (task_id === -1) {
          delay = 4000;
        }
        setTimeout(() => {
          router.push({
            pathname: `/detail/${token_id}`,
            query: {
              message: "success",
            },
          });
        }, delay);
      } catch (err) {
        const { data } = err;
        if (data && data.message) {
          alert(data.message);
        } else {
          alert("There's an error");
        }
      }
    } else {
      alert("Please connect your wallet on Arbitrum network");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const mintPrice = await nftContract.getMintPrice();
      setMintPrice(
        (parseFloat(parseBalance(mintPrice)) * 1.01 + 0.008).toFixed(4)
      );

      const withdrawalAmount = await nftContract.withdrawalAmount();
      setWithdrawalAmount(parseBalance(withdrawalAmount));

      let seconds = (await nftContract.timeUntilSale()).toNumber();
      setSaleSeconds(seconds);

      const tokenIds = await api.random_token();
      setTokenIds(tokenIds);
    };

    getData();
  }, [nftContract, marketContract]);

  return (
    <>
      <Head>
        <title>Mint | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      <MainWrapper>
        {saleSeconds > 0 && !countdownCompleted ? (
          <CenterBox>
            <Typography variant="h4" component="span">
              SALE
            </Typography>
            <Typography
              variant="h4"
              component="span"
              color="primary"
              sx={{ ml: 1.5 }}
            >
              OPENS IN
            </Typography>
          </CenterBox>
        ) : (
          <CenterBox>
            <Typography variant="h4" component="span">
              GET A
            </Typography>
            <Typography
              variant="h4"
              component="span"
              color="primary"
              sx={{ ml: 1.5 }}
            >
              RANDOM WALK
            </Typography>
            <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
              NFT FOR
            </Typography>
            <Typography
              variant="h4"
              component="span"
              color="primary"
              sx={{ ml: 1.5 }}
            >
              {mintPrice}Ξ
            </Typography>
          </CenterBox>
        )}
        <Box mt={3}>
          <Grid container spacing={4}>
            {saleSeconds > 0 && !countdownCompleted && (
              <Grid item xs={12} sm={12} md={6} lg={6}>
                <Box mb={2}>
                  <Countdown
                    date={Date.now() + saleSeconds * 1000}
                    renderer={Counter}
                    onComplete={() => setCountdownCompleted(true)}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={12} md={6} lg={saleSeconds <= 0 ? 7 : 6}>
              <Box mb={3}>
                <Typography variant="body1" color="secondary" gutterBottom>
                  Withdrawal to mint ratio
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <span>
                    {(
                      parseFloat(withdrawalAmount) / parseFloat(mintPrice)
                    ).toFixed(2)}
                  </span>
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="body1" color="secondary" gutterBottom>
                  Verified NFT Contract
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <StyledLink
                    target="_blank"
                    href={`https://arbiscan.io/address/${NFT_ADDRESS}#code`}
                  >
                    {NFT_ADDRESS}
                  </StyledLink>
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="body1" color="secondary" gutterBottom>
                  Verified Market Contract
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <StyledLink
                    target="_blank"
                    href={`https://arbiscan.io/address/${MARKET_ADDRESS}#code`}
                  >
                    {MARKET_ADDRESS}
                  </StyledLink>
                </Typography>
              </Box>
              <CenterBox>
                <Hidden smDown>
                  <div
                    style={{
                      background: `url('images/pink_line.png') left top`,
                      width: 64,
                      height: 8,
                    }}
                  ></div>
                </Hidden>
                <MintActiveButton onClick={handleMint}>
                  Mint now
                </MintActiveButton>
              </CenterBox>
            </Grid>
            {(saleSeconds <= 0 || countdownCompleted) && tokenIds.length > 0 && (
              <Grid item xs={12} sm={12} md={6} lg={5}>
                <Fade autoplay arrows={false}>
                  {tokenIds.map((id, i) => {
                    const fileName = id.toString().padStart(6, "0");
                    return (
                      <StyledCard key={i} style={{ margin: 2 }}>
                        <CardActionArea href={`/detail/${id}`}>
                          <NFTImage
                            image={`http://69.10.55.2/images/randomwalk/${fileName}_black_thumb.jpg`}
                          />
                          <NFTInfoWrapper>
                            <Typography variant="body1">
                              {formatId(id)}
                            </Typography>
                          </NFTInfoWrapper>
                        </CardActionArea>
                      </StyledCard>
                    );
                  })}
                </Fade>
              </Grid>
            )}
          </Grid>
        </Box>
      </MainWrapper>
    </>
  );
};

export default Mint;

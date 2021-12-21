import React, { useState, useEffect } from "react";
import { Box, Typography, MenuItem, FormControl } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { ethers } from "ethers";

import PaginationOfferGrid from "../components/PaginationOfferGrid";
import NFTSalesHistory from "../components/NFTSalesHistory";
import { MainWrapper } from "../components/styled";
import { getOfferById } from "../hooks/useOffer";
import useNFTContract from "../hooks/useNFTContract";
import useMarketContract from "../hooks/useMarketContract";
import { NFT_ADDRESS } from "../config/app";
import { useTransactions } from "../hooks/useTransactions";

const Marketplace = () => {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);

  const [filterMode, setFilterMode] = useState("0");

  const nftContract = useNFTContract();
  const marketContract = useMarketContract();
  const transactions = useTransactions();

  const handleChange = async (e: SelectChangeEvent) => {
    setFilterMode(e.target.value);
  };

  useEffect(() => {
    const getSalesHistory = async () => {
      try {
        setSalesHistory(transactions || []);
      } catch (err) {
        console.log(err);
      }
    };

    getSalesHistory();
  }, [transactions]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        setLoading(true);
        const numOffers = await marketContract.numOffers();
        const offerIds = Object.keys(new Array(numOffers.toNumber()).fill(0));
        let offers = await Promise.all(
          offerIds.map((offerId) =>
            getOfferById(nftContract, marketContract, offerId)
          )
        );
        const zeroAddress = ethers.constants.AddressZero;
        offers = offers
          .filter(
            (offer) => offer && offer.active && offer.buyer === zeroAddress
          )
          .sort((x, y) => x.price - y.price);

        // if filterMode == "With Offers"
        if (filterMode == "1") {
          offers = await Promise.all(
            offers.map(async (offer) => {
              const buyOfferIds = await marketContract.getBuyOffers(
                NFT_ADDRESS,
                offer.id
              );
              return buyOfferIds.length > 0 ? offer : null;
            })
          );
          offers = offers.reverse().filter((e) => {
            return e != null;
          });
        }
        setCollection(offers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getTokens();
  }, [nftContract, marketContract, filterMode]);

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
          NFTS
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="secondary"
          sx={{ ml: 1.5 }}
        >
          MARKETPLACE
        </Typography>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <FormControl sx={{ m: 1, minWidth: 80 }}>
          <Select
            value={filterMode}
            onChange={handleChange}
            displayEmpty
            autoWidth
            inputProps={{ "aria-label": "Without label" }}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1}>With Offers</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <PaginationOfferGrid loading={loading} data={collection} />
      {salesHistory.length > 0 && <NFTSalesHistory data={salesHistory} />}
    </MainWrapper>
  );
};

export default Marketplace;

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";

import PaginationGrid from "../components/PaginationGrid";
import { MainWrapper } from "../components/styled";

import useNFTContract from "../hooks/useNFTContract";
import api from "../services/api";

const Gallery = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState([]);
  const [address, setAddress] = useState(null);
  const [sortBy, setSortBy] = useState("tokenId");
  const contract = useNFTContract();

  const handleChange = async (e: any) => {
    setSortBy(e.target.value);
    router.query["sortBy"] = e.target.value;
    router.push({ pathname: router.pathname, query: router.query });
  };

  useEffect(() => {
    const address = router.query["address"] as string;
    let s = router.query["sortBy"] as string;
    s = s || "tokenId";
    setSortBy(s);

    const getTokens = async () => {
      try {
        setLoading(true);
        let tokenIds = [];
        if (s == "tokenId") {
          if (address) {
            const tokens = await contract.walletOfOwner(address);
            tokenIds = tokens.map((t) => t.toNumber()).reverse();
          } else {
            const balance = await contract.totalSupply();
            tokenIds = Object.keys(new Array(balance.toNumber()).fill(0));
            tokenIds = tokenIds.reverse();
          }
        } else if (s == "beauty") {
          if (address) {
            const tokens = await contract.walletOfOwner(address);
            let total_ids = await api.ratingOrder();
            tokenIds = tokens.map((t) => t.toNumber()).reverse();
            tokenIds = total_ids.filter((x) => tokenIds.includes(x));
          } else {
            tokenIds = await api.ratingOrder();
            tokenIds = tokenIds.reverse();
          }
          tokenIds = tokenIds.filter(
            (element, i) => i === tokenIds.indexOf(element)
          );
        }

        setAddress(address);
        setCollection(tokenIds);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getTokens();
  }, [contract, router]);

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
          GALLERY
        </Typography>
      </Box>
      {address && (
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          Owned by {address}
        </Typography>
      )}

      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
        <Typography
          align="left"
          variant="body1"
          color="secondary"
          display="inline"
        >
          Sort By
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 80, display: "inline" }}>
          <Select
            value={sortBy}
            onChange={handleChange}
            displayEmpty
            autoWidth
            inputProps={{ "aria-label": "Without label" }}
          >
            <MenuItem value="tokenId">Token Id</MenuItem>
            <MenuItem value="beauty">Beauty</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <PaginationGrid loading={loading} data={collection} />
    </MainWrapper>
  );
};

export default Gallery;

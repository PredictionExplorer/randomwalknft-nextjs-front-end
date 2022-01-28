import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Radio, Button } from "@mui/material";
import { MainWrapper } from "../components/styled";
import NFTTrait2 from "../components/NFTTrait2";
import api from "../services/api";

const Compare = () => {
  const [firstId, setFirstId] = useState(0);
  const [secondId, setSecondId] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState("first");
  const [isConfirmed, setConfirmed] = useState(false);
  const handleChange = (event) => {
    setSelectedNFT(event.target.value);
  };

  const onConfirmHandler = async () => {
    setConfirmed(true);
    await api.add_game(firstId, secondId, selectedNFT == "first" ? 1 : 0);
  };

  useEffect(() => {
    const getToken = async () => {
      const tokenIds = await api.random();
      setFirstId(tokenIds[0]);
      setSecondId(tokenIds[1]);
    };
    getToken();
  }, []);

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
          BEAUTY CONTEST
        </Typography>
      </Box>
      <Grid
        container
        spacing={4}
        mt={4}
        textAlign="center"
        justifyContent="center"
      >
        <Grid item xs={12} sm={8} md={6}>
          <NFTTrait2 id={firstId} />
          <Radio
            checked={selectedNFT === "first"}
            onChange={handleChange}
            value="first"
            name="selected-nft"
            disabled={isConfirmed}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={6}>
          <NFTTrait2 id={secondId} />
          <Radio
            checked={selectedNFT === "second"}
            onChange={handleChange}
            value="second"
            name="selected-nft"
            disabled={isConfirmed}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="center" mt={4}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onConfirmHandler}
          disabled={isConfirmed}
        >
          {isConfirmed ? "Confirmed" : "Confirm"}
        </Button>
      </Grid>
    </MainWrapper>
  );
};

export default Compare;

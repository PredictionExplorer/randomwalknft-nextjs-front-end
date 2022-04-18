import React from "react";
import Image from "next/image";
import { Box, Typography, Button, Link, Hidden } from "@mui/material";
import { MainWrapper, CenterBox, MintButton } from "../components/styled";

function Home() {
  return (
    <>
      <img
        src="images/curves.png"
        alt="curves"
        style={{
          position: "fixed",
          bottom: 100,
          objectFit: "fill",
          height: 400,
          minWidth: "100%",
        }}
      />
      <div
        style={{
          backgroundImage: `url('images/background.jpg')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          height: "100vh",
        }}
      >
        <MainWrapper>
          <CenterBox>
            <Typography variant="h4" component="span" color="primary">
              RANDOM
            </Typography>
            <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
              WALK
            </Typography>
            <Typography
              variant="h4"
              component="span"
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              NFT
            </Typography>
          </CenterBox>
          <Box mt={3}>
            <Typography align="left" variant="body1" gutterBottom>
              100% of the ΞTH spent on minting goes back to the minters through
              a&nbsp;
              <Link
                href="/redeem"
                style={{
                  cursor: "pointer",
                  color: "white",
                  textDecoration: "underline",
                }}
              >
                novel incentive structure
              </Link>
              .
            </Typography>
            <Typography align="left" variant="body1" gutterBottom>
              Trade your NFTs on the built-in 0.00% fee marketplace.
            </Typography>
          </Box>
          <CenterBox mt={3}>
            <MintButton href="/mint">Mint now</MintButton>
            <Hidden smDown>
              <div
                style={{
                  background: `url('images/white_line.png') left top`,
                  width: 64,
                  height: 8,
                }}
              ></div>
            </Hidden>
          </CenterBox>
        </MainWrapper>
      </div>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: { title: "", description: "HomePage - " },
  };
}

export default Home;

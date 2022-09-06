import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Link, Hidden } from "@mui/material";
import { MainWrapper, CenterBox, MintButton } from "../components/styled";
import ApiService from "../services/api";

function NewHome() {
  const [blackVideo, setBlackVideo] = useState(null);
  const ref = useRef(null);

  const setRandomVideo = async () => {
    const tokenIds = await ApiService.random_token();
    const fileName = tokenIds[0].toString().padStart(6, "0");
    console.log(tokenIds[0]);
    setBlackVideo(
      `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_triple.mp4`
    );
  };

  useEffect(() => {
    setRandomVideo();
  }, []);

  useEffect(() => {
    if (blackVideo) {
      ref.current.load();
    }
  }, [blackVideo]);

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
      {blackVideo && (
        <div
          style={{
            position: "fixed",
            top: 125,
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: -1,
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            ref={ref}
          >
            <source src={blackVideo} type="video/mp4"></source>
          </video>
        </div>
      )}
      <div
        style={{
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

export default NewHome;

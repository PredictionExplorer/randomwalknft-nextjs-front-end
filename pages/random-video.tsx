import React, { useEffect, useState, useRef } from "react";
import { Typography, Link } from "@mui/material";
import Head from "next/head";

import ApiService from "../services/api";
import { formatId, getAssetsUrl } from "../utils";

const RandomVideo = (props) => {
  const [tokenId, setTokenId] = useState(null);
  const [blackVideo, setBlackVideo] = useState(null);
  const ref = useRef(null);

  const setRandomVideo = async () => {
    const tokenIds = await ApiService.random_token();
    const fileName = tokenIds[0].toString().padStart(6, "0");
    setTokenId(tokenIds[0]);
    setBlackVideo(getAssetsUrl(`${fileName}_black_single.mp4`));
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
      <Head>
        <title>Random Video | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      {blackVideo && (
        <div
          style={{
            position: "absolute",
            top: 125,
            bottom: 64,
            left: 0,
            right: 0,
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onEnded={setRandomVideo}
            ref={ref}
          >
            <source src={blackVideo} type="video/mp4"></source>
          </video>
        </div>
      )}
      {tokenId && (
        <Typography
          variant="h6"
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Link style={{ color: "#fff" }} href={`/detail/${tokenId}`}>
            {formatId(tokenId)}
          </Link>
        </Typography>
      )}
    </>
  );
};

export default RandomVideo;

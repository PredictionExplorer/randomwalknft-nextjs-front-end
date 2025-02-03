import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";

import { StyledLink } from "../components/styled";
import api from "../services/api";
import { formatId, getAssetsUrl } from "../utils";

const Random = (props) => {
  const [tokenId, setTokenId] = useState(null);
  const [blackImage, setBlackImage] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const tokenIds = await api.random_token();
      const fileName = tokenIds[0].toString().padStart(6, "0");
      setTokenId(tokenIds[0]);
      setBlackImage(getAssetsUrl(`${fileName}_black.png`));
    };
    getToken();
  }, []);

  return (
    <>
      <Head>
        <title>Random Image | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      {blackImage && (
        <div
          style={{
            backgroundImage: `url(${blackImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            position: "absolute",
            top: 125,
            bottom: 64,
            left: 0,
            right: 0,
          }}
        >
          {tokenId && (
            <Typography
              variant="h6"
              sx={{
                position: "absolute",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <StyledLink href={`/detail/${tokenId}`}>
                {formatId(tokenId)}
              </StyledLink>
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default Random;

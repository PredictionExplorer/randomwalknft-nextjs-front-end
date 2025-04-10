import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";

import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import Head from "next/head";

import NFTTrait from "../../components/NFTTrait";
import NFTBuyOffers from "../../components/NFTBuyOffers";
import NFTHistory from "../../components/NFTHistory";
import { MainWrapper } from "../../components/styled";
import { useActiveWeb3React } from "../../hooks/web3";

import api, { baseUrl } from "../../services/api";
import axios from "axios";
import { getAssetsUrl } from "../../utils";

const Detail = ({ nft }) => {
  const router = useRouter();
  const { seller } = router.query;
  const { account } = useActiveWeb3React();
  const [darkTheme, setDarkTheme] = useState(true);
  const [buyOffers, setBuyOffers] = useState([]);
  const [sellOffers, setSellOffers] = useState([]);
  const [userSellOffers, setUserSellOffers] = useState([]);
  const fileName = nft?.id.toString().padStart(6, "0");
  const blackVideo = getAssetsUrl(`${fileName}_black_triple.mp4`);
  const ref = useRef(null);

  useEffect(() => {
    if (nft) {
      ref.current.load();
    }
  }, [blackVideo]);

  useEffect(() => {
    const getOffers = async () => {
      const buy_offers = await api.get_buy(nft?.id);
      setBuyOffers(buy_offers);
      const sell_offers = await api.get_sell(nft?.id);
      setSellOffers(sell_offers);
      const userSellOffers = sell_offers.filter((x) => {
        return x.SellerAddr == account;
      });
      setUserSellOffers(userSellOffers);
    };

    let hash = router.asPath.match(/#([a-z0-9]+)/gi);
    const darkModes = [
      "#black_image",
      "#black_single_video",
      "#black_triple_video",
    ];
    const lightModes = [
      "#white_image",
      "#white_single_video",
      "#white_triple_video",
    ];

    if (hash) {
      if (darkModes.includes(hash[0])) {
        setDarkTheme(true);
      } else if (lightModes.includes(hash[0])) {
        setDarkTheme(false);
      }
    }
    getOffers();
  }, [account, nft, router]);

  if (!nft) return <></>;

  return (
    <>
      <Head>
        <title>NFT #{nft.id} | Random Walk NFT</title>
      </Head>
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
              filter: "blur(3px) opacity(0.5)",
            }}
            ref={ref}
          >
            <source src={blackVideo} type="video/mp4"></source>
          </video>
        </div>
      )}
      <MainWrapper
        maxWidth={false}
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {router.query && router.query.message && (
          <Box px={8} mb={2}>
            <Alert variant="outlined" severity="success">
              {router.query.message === "success"
                ? "Media files are being generated. Please refrersh the page in a few minutes."
                : ""}
            </Alert>
          </Box>
        )}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ position: "relative", height: 60 }}
        >
          <Divider style={{ background: "#121212", width: "100%" }} />
          <ToggleButtonGroup
            value={darkTheme}
            exclusive
            onChange={() => setDarkTheme(!darkTheme)}
            style={{ position: "absolute" }}
          >
            <ToggleButton value={true}>Dark theme</ToggleButton>
            <ToggleButton value={false}>White theme</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <NFTTrait
          nft={nft}
          darkTheme={darkTheme}
          seller={seller}
          buy_offers={buyOffers}
          sell_offers={sellOffers}
          user_sell_offers={userSellOffers}
        />
        {buyOffers.length > 0 && (
          <NFTBuyOffers
            offers={buyOffers}
            nft={nft}
            account={account}
            userSellOffers={userSellOffers}
          />
        )}
        {nft.tokenHistory.length > 0 && (
          <NFTHistory tokenHistory={nft.tokenHistory} />
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const tokenId = Array.isArray(id) ? id[0] : id;

  const { data } = await axios.get(baseUrl + `tokens/${tokenId}`);
  const url = `http://69.10.55.2:9291/api/rwalk/tokens/history/${tokenId}/0x895a6F444BE4ba9d124F61DF736605792B35D66b/0/1000`;
  const res = await axios.get(url);
  if (data) {
    data.tokenHistory = res?.data?.TokenHistory;
  }

  return {
    props: {
      nft: data,
      title: "Detail",
      description: `NFT#${data?.id} Details - `,
    },
  };
}

export default Detail;

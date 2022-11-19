import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import {
  Box,
  Typography,
  CardActionArea,
  Button,
  TextField,
  Grid,
  Link,
  Container,
  Menu,
  MenuItem,
} from "@mui/material";

import { CopyToClipboard } from "react-copy-to-clipboard";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";

import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";

import { MARKET_ADDRESS, NFT_ADDRESS } from "../config/app";
import NFTVideo from "./NFTVideo";
import useNFTContract from "../hooks/useNFTContract";
import useMarketContract from "../hooks/useMarketContract";
import { useActiveWeb3React } from "../hooks/web3";
import { formatId } from "../utils";
import {
  StyledCard,
  SectionWrapper,
  NFTImage,
  NFTInfoWrapper,
  NFTPrice,
} from "./styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const NFTTrait = ({
  nft,
  darkTheme,
  seller,
  buy_offers,
  sell_offers,
  user_sell_offers,
}) => {
  const {
    id,
    name,
    seed,
    white_image_url,
    black_image_url,
    black_image_thumb_url,
    white_image_thumb_url,
    white_single_video_url,
    black_single_video_url,
    white_triple_video_url,
    black_triple_video_url,
    rating,
  } = nft;
  const [open, setOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);
  const [theme, setTheme] = useState(darkTheme ? "black" : "white");
  const [price, setPrice] = useState("");
  const [tokenName, setTokenName] = useState(name);
  const [address, setAddress] = useState("");
  const [accountTokenIds, setAccountTokenIds] = useState([]);
  const [realOwner, setRealOwner] = useState("");
  const [highestOffer, setHighestOffer] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const nftContract = useNFTContract();
  const marketContract = useMarketContract();
  const { account, library } = useActiveWeb3React();

  const handlePlay = (videoPath) => {
    fetch(videoPath).then((res) => {
      if (res.ok) {
        setVideoPath(videoPath);
        setOpen(true);
      } else {
        alert("Video is being generated, come back later");
      }
    });
  };

  const handleMakeSell = async () => {
    try {
      const approvedAll = await nftContract.isApprovedForAll(
        account,
        MARKET_ADDRESS
      );
      if (!approvedAll) {
        await nftContract
          .setApprovalForAll(MARKET_ADDRESS, true)
          .then((tx) => tx.wait());
      }
      await marketContract
        .makeSellOffer(NFT_ADDRESS, id, ethers.utils.parseEther(price))
        .then((tx) => tx.wait());
      window.location.reload();
    } catch (err) {
      alert(err.data ? err.data.message : err.message);
    }
  };

  const handleMakeBuy = async () => {
    try {
      await marketContract
        .makeBuyOffer(NFT_ADDRESS, id, {
          value: ethers.utils.parseEther(price),
        })
        .then((tx) => tx.wait());
      window.location.reload();
    } catch (err) {
      alert(err.data ? err.data.message : err.message);
    }
  };

  const handleCancelSell = async () => {
    try {
      await marketContract
        .cancelSellOffer(sell_offers[0].OfferId)
        .then((tx) => tx.wait());
      window.location.reload();
    } catch (err) {
      alert(err.data ? err.data.message : err.message);
    }
  };

  const handleAcceptSell = async () => {
    try {
      const offerId = sell_offers[0].OfferId;
      const offer = await marketContract.offers(offerId);
      await marketContract
        .acceptSellOffer(offerId, {
          value: ethers.BigNumber.from(offer.price),
        })
        .then((tx) => tx.wait());

      router.push("/my-nfts");
    } catch (err) {
      alert(err.data ? err.data.message : err.message);
    }
  };

  const handleTransfer = async () => {
    try {
      await nftContract
        .transferFrom(account, address, id)
        .then((tx) => tx.wait());

      router.push("/my-nfts");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSetTokenName = async () => {
    try {
      await nftContract.setTokenName(id, tokenName).then((tx) => tx.wait());
      router.push("/my-nfts");
    } catch (err) {
      alert(err.data ? err.data.message : err.message);
    }
  };

  const handlePrev = () => router.push(`/detail/${Math.max(id - 1, 0)}`);

  const handleNext = async () => {
    const totalSupply = await nftContract.totalSupply();
    router.push(`/detail/${Math.min(id + 1, totalSupply.toNumber() - 1)}`);
  };

  const handlePrevInWallet = () => {
    const index = accountTokenIds.indexOf(id);
    router.push(`/detail/${accountTokenIds[Math.max(index - 1, 0)]}`);
  };

  const handleNextInWallet = async () => {
    const index = accountTokenIds.indexOf(id);
    router.push(
      `/detail/${
        accountTokenIds[Math.min(index + 1, accountTokenIds.length - 1)]
      }`
    );
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

  const convertTimestampToDateTime = (timestamp: any) => {
    var date_ob = new Date(timestamp * 1000);
    var year = date_ob.getFullYear();
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var date = ("0" + date_ob.getDate()).slice(-2);
    var hours = ("0" + date_ob.getHours()).slice(-2);
    var minutes = ("0" + date_ob.getMinutes()).slice(-2);
    var seconds = ("0" + date_ob.getSeconds()).slice(-2);
    var result =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;
    return result;
  };

  useEffect(() => {
    let maxOfferPrice = 0;
    buy_offers.map(async (offer) => {
      if (!maxOfferPrice || maxOfferPrice < offer.Price) {
        maxOfferPrice = offer.Price;
        setHighestOffer(maxOfferPrice);
      }
    });
  }, [marketContract, nftContract, buy_offers]);

  useEffect(() => {
    const getOwner = async () => {
      if (nftContract) {
        const owner = await nftContract.ownerOf(nft.id);
        setRealOwner(owner);
      }
    };
    getOwner();
  }, [nftContract, nft]);

  useEffect(() => {
    setTheme(darkTheme ? "black" : "white");
  }, [darkTheme]);

  useEffect(() => {
    const { hash } = location;
    if (hash === "#black_image" || hash === "#white_image") {
      setTheme(hash.includes("black") ? "black" : "white");
      setImageOpen(true);
    } else if (
      hash === "#black_single_video" ||
      hash === "#white_single_video"
    ) {
      setTheme(hash.includes("black") ? "black" : "white");
      handlePlay(
        hash.includes("black") ? black_single_video_url : white_single_video_url
      );
    } else if (
      hash === "#black_triple_video" ||
      hash === "#white_triple_video"
    ) {
      setTheme(hash.includes("black") ? "black" : "white");
      handlePlay(
        hash.includes("black") ? black_triple_video_url : white_triple_video_url
      );
    }
  }, [
    black_single_video_url,
    white_single_video_url,
    black_triple_video_url,
    white_triple_video_url,
  ]);

  useEffect(() => {
    if (sell_offers.length > 0) {
      setSellPrice(sell_offers[0].Price);
    }
    return () => setSellPrice(null);
  }, [account, sell_offers]);

  useEffect(() => {
    const getAccountTokenIds = async () => {
      const tokenIds = await nftContract.walletOfOwner(account);
      setAccountTokenIds(tokenIds.map((tokenId) => tokenId.toNumber()));
    };
    if (account) {
      getAccountTokenIds();
    }
  }, [account, library, nftContract]);

  return (
    <Container>
      <SectionWrapper>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <StyledCard>
              <CardActionArea onClick={() => setImageOpen(true)}>
                <NFTImage
                  image={
                    theme === "black"
                      ? black_image_thumb_url
                      : white_image_thumb_url
                  }
                />
                <NFTInfoWrapper>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                      color: theme === "black" ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {formatId(id)}
                  </Typography>
                  {sellPrice && (
                    <NFTPrice variant="body1">{sellPrice.toFixed(4)}Ξ</NFTPrice>
                  )}
                </NFTInfoWrapper>
              </CardActionArea>
            </StyledCard>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{ width: "100%" }}
                    onClick={handleMenuOpen}
                  >
                    Copy link
                    {anchorEl ? <ExpandLess /> : <ExpandMore />}
                  </Button>

                  <Menu
                    elevation={0}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <CopyToClipboard
                      text={
                        theme === "black"
                          ? black_single_video_url
                          : white_single_video_url
                      }
                    >
                      <MenuItem
                        style={{ minWidth: 166 }}
                        onClick={handleMenuClose}
                      >
                        Single Video
                      </MenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard
                      text={
                        theme === "black"
                          ? black_triple_video_url
                          : white_triple_video_url
                      }
                    >
                      <MenuItem onClick={handleMenuClose}>
                        Triple Video
                      </MenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard
                      text={
                        theme === "black" ? black_image_url : white_image_url
                      }
                    >
                      <MenuItem onClick={handleMenuClose}>Image</MenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard text={window.location.href}>
                      <MenuItem onClick={handleMenuClose}>Detail Page</MenuItem>
                    </CopyToClipboard>
                  </Menu>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{ width: "100%" }}
                    onClick={handlePrev}
                  >
                    Prev
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{ width: "100%" }}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {account === (seller || realOwner) && accountTokenIds.length > 0 && (
              <Box mt={1}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ width: "100%" }}
                      onClick={handlePrevInWallet}
                    >
                      Prev In Wallet
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ width: "100%" }}
                      onClick={handleNextInWallet}
                    >
                      Next In Wallet
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            {imageOpen && (
              <Lightbox
                image={theme === "black" ? black_image_url : white_image_url}
                onClose={() => setImageOpen(false)}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            <NFTVideo
              image_thumb={
                theme === "black"
                  ? black_image_thumb_url
                  : black_image_thumb_url
              }
              onClick={() =>
                handlePlay(
                  theme === "black"
                    ? black_single_video_url
                    : white_single_video_url
                )
              }
            />
            <Box mt={2}>
              <Typography variant="body1" align="center">
                Single Video
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
              <NFTVideo
                image_thumb={
                  theme === "black"
                    ? black_image_thumb_url
                    : black_image_thumb_url
                }
                onClick={() =>
                  handlePlay(
                    theme === "black"
                      ? black_triple_video_url
                      : white_triple_video_url
                  )
                }
              />
              <Box mt={2}>
                <Typography variant="body1" align="center">
                  Triple Video
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              {nft.tokenHistory[0]?.Record?.TimeStamp && (
                <Box mb={3}>
                  <Typography align="left" variant="body1" color="secondary">
                    Minted Date
                  </Typography>
                  <Typography align="left" variant="body2" color="textPrimary">
                    {convertTimestampToDateTime(
                      nft.tokenHistory[0]?.Record?.TimeStamp
                    )}
                  </Typography>
                </Box>
              )}
              <Box mb={3}>
                <Typography align="left" variant="body1" color="secondary">
                  Beauty Score
                </Typography>
                <Typography align="left" variant="body2" color="textPrimary">
                  {rating.toFixed(2)}
                </Typography>
              </Box>
              {highestOffer && (
                <Box mb={3}>
                  <Typography align="left" variant="body1" color="secondary">
                    Highest Offer
                  </Typography>
                  <Typography align="left" variant="body2" color="textPrimary">
                    {highestOffer.toFixed(4)}Ξ
                  </Typography>
                </Box>
              )}
              <Box mb={3}>
                <Typography align="left" variant="body1" color="secondary">
                  Owner
                </Typography>
                <Typography align="left" variant="body2" color="textPrimary">
                  <Link
                    style={{ color: "#fff" }}
                    href={`/gallery?address=${seller || realOwner}`}
                  >
                    {seller || realOwner}
                  </Link>
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography align="left" variant="body1" color="secondary">
                  Seed
                </Typography>
                <Typography align="left" variant="body2" color="textPrimary">
                  {seed}
                </Typography>
              </Box>
              {name && (
                <Box mb={3}>
                  <Typography align="left" variant="body1" color="secondary">
                    Name
                  </Typography>
                  <Typography align="left" variant="body2" color="textPrimary">
                    {name}
                  </Typography>
                </Box>
              )}
              <Box>
                {account === realOwner ? (
                  <>
                    <Box mb={3}>
                      <Typography gutterBottom variant="h6" align="left">
                        TRANSFER
                      </Typography>
                      <Box display="flex">
                        <TextField
                          variant="filled"
                          color="secondary"
                          placeholder="Enter address here"
                          fullWidth
                          size="small"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleTransfer}
                        >
                          Send
                        </Button>
                      </Box>
                    </Box>
                    <Box mb={3}>
                      <Typography gutterBottom variant="h6" align="left">
                        PUT ON SALE
                      </Typography>
                      <Box display="flex">
                        <TextField
                          type="number"
                          variant="filled"
                          color="secondary"
                          placeholder="Enter ETH price here"
                          value={price}
                          size="small"
                          style={{ flex: 1 }}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleMakeSell}
                        >
                          Sell
                        </Button>
                      </Box>
                    </Box>
                    <Box mb={3}>
                      <Typography gutterBottom variant="h6" align="left">
                        RENAME
                      </Typography>
                      <Box display="flex">
                        <TextField
                          variant="filled"
                          color="secondary"
                          placeholder="Enter token name here"
                          value={tokenName}
                          size="small"
                          fullWidth
                          onChange={(e) => setTokenName(e.target.value)}
                        />
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleSetTokenName}
                        >
                          Update
                        </Button>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    {!user_sell_offers.length && (
                      <Box mb={3}>
                        <Typography gutterBottom variant="h6" align="left">
                          BID
                        </Typography>
                        <Box display="flex">
                          <TextField
                            type="number"
                            variant="filled"
                            color="secondary"
                            placeholder="Enter ETH price here"
                            value={price}
                            size="small"
                            style={{ flex: 1 }}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                          <Button
                            color="secondary"
                            variant="contained"
                            onClick={handleMakeBuy}
                          >
                            Make Offer
                          </Button>
                        </Box>
                      </Box>
                    )}
                    {user_sell_offers.length ? (
                      <Box mb={3}>
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleCancelSell}
                          size="large"
                          style={{ height: "100%" }}
                        >
                          Cancel Sell Offer
                        </Button>
                      </Box>
                    ) : (
                      realOwner &&
                      realOwner.toLowerCase() ===
                        MARKET_ADDRESS.toLowerCase() && (
                        <Box mb={3}>
                          <Button
                            color="secondary"
                            variant="contained"
                            onClick={handleAcceptSell}
                            size="large"
                            style={{ height: "100%" }}
                          >
                            Buy Now for {sellPrice && sellPrice.toFixed(4)}Ξ
                          </Button>
                        </Box>
                      )
                    )}
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        <ModalVideo
          channel="custom"
          url={videoPath}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      </SectionWrapper>
    </Container>
  );
};

export default NFTTrait;

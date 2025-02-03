import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { NFT_ADDRESS } from "../config/app";
import useNFTContract from "./useNFTContract";
import useMarketContract from "./useMarketContract";
import { getAssetsUrl } from "../utils";

export const getOfferById = async (nftContract, marketContract, offerId) => {
  const offer = await marketContract.offers(offerId);
  const tokenId = offer.tokenId.toNumber();
  const tokenName = await nftContract.tokenNames(tokenId);
  const fileName = tokenId.toString().padStart(6, "0");
  const image_thumb = getAssetsUrl(`${fileName}_black_thumb.jpg`);

  if (NFT_ADDRESS.toLowerCase() !== offer.nftAddress.toLowerCase()) {
    return null;
  }

  return {
    id: offerId,
    active: offer.active,
    buyer: offer.buyer,
    seller: offer.seller,
    price: parseFloat(ethers.utils.formatEther(offer.price)),
    tokenId,
    tokenName,
    image_thumb,
  };
};

export const useOffer = (offerId) => {
  const nftContract = useNFTContract();
  const marketContract = useMarketContract();
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const getOffer = async () => {
      try {
        const offer = await getOfferById(nftContract, marketContract, offerId);
        setOffer(offer);
      } catch (err) {
        console.log(err);
      }
    };

    if (offerId != null) {
      getOffer();
    }
  }, [nftContract, marketContract, offerId]);

  return offer;
};

export const useBuyOfferIds = (tokenId) => {
  const contract = useMarketContract();
  const [buyOfferIds, setBuyOfferIds] = useState([]);

  useEffect(() => {
    const getOfferIds = async () => {
      try {
        const buyOfferIds = await contract.getBuyOffers(NFT_ADDRESS, tokenId);
        setBuyOfferIds(buyOfferIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (tokenId != null) {
      getOfferIds();
    }
  }, [contract, tokenId]);

  return buyOfferIds;
};

export const useBuyTokenIds = (address) => {
  const contract = useMarketContract();
  const [buyTokenIds, setBuyTokenIds] = useState([]);

  useEffect(() => {
    const getTokenIds = async () => {
      try {
        const buyTokenIds = await contract.getBuyTokensBy(NFT_ADDRESS, address);
        setBuyTokenIds(buyTokenIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (address != null) {
      getTokenIds();
    }
  }, [contract, address]);

  return buyTokenIds;
};

export const useAccountBuyOfferIds = (address) => {
  const contract = useMarketContract();
  const [buyOfferIds, setBuyOfferIds] = useState([]);

  useEffect(() => {
    const getOfferIds = async () => {
      try {
        const buyOfferIds = await contract.getBuyOffersBy(NFT_ADDRESS, address);
        setBuyOfferIds(buyOfferIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (address != null) {
      getOfferIds();
    }
  }, [contract, address]);

  return buyOfferIds;
};

export const useSellOfferIds = (tokenId) => {
  const contract = useMarketContract();
  const [sellOfferIds, setSellOfferIds] = useState([]);

  useEffect(() => {
    const getOfferIds = async () => {
      try {
        const sellOfferIds = await contract.getSellOffers(NFT_ADDRESS, tokenId);
        setSellOfferIds(sellOfferIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (tokenId != null) {
      getOfferIds();
    }
  }, [contract, tokenId]);

  return sellOfferIds;
};

export const useAccountSellOfferIds = (address) => {
  const contract = useMarketContract();
  const [sellOfferIds, setSellOfferIds] = useState([]);

  useEffect(() => {
    const getOfferIds = async () => {
      try {
        const sellOfferIds = await contract.getSellOffersBy(
          NFT_ADDRESS,
          address
        );
        setSellOfferIds(sellOfferIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (address != null) {
      getOfferIds();
    }
  }, [contract, address]);

  return sellOfferIds;
};

export const useSellTokenIds = (address) => {
  const contract = useMarketContract();
  const [sellTokenIds, setSellTokenIds] = useState([]);

  useEffect(() => {
    const getTokenIds = async () => {
      try {
        const sellTokenIds = await contract.getSellTokenBy(
          NFT_ADDRESS,
          address
        );
        setSellTokenIds(sellTokenIds.map((id) => id.toNumber()));
      } catch (err) {
        console.log(err);
      }
    };

    if (address != null) {
      getTokenIds();
    }
  }, [contract, address]);

  return sellTokenIds;
};

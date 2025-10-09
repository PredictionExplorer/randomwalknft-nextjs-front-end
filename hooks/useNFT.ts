import { useState, useEffect } from "react";
import useNFTContract from "./useNFTContract";
import api from "../services/api";
import { getAssetsUrl } from "../utils";

// In-memory cache for NFT data
const nftCache = new Map();
// Pending requests to prevent duplicate API calls
const pendingRequests = new Map();

export const useNFT = (tokenId) => {
  const contract = useNFTContract();
  const [nft, setNft] = useState(null);

  useEffect(() => {
    const getNFT = async () => {
      try {
        // Check cache first
        if (nftCache.has(tokenId)) {
          setNft(nftCache.get(tokenId));
          return;
        }

        // Check if there's already a pending request for this tokenId
        if (pendingRequests.has(tokenId)) {
          const cachedData = await pendingRequests.get(tokenId);
          setNft(cachedData);
          return;
        }

        // Create new request promise
        const requestPromise = (async () => {
          const nft = await api.get_info(tokenId);
          const fileName = tokenId.toString().padStart(6, "0");
          const white_image = getAssetsUrl(`${fileName}_white.png`);
          const white_image_thumb = getAssetsUrl(`${fileName}_white_thumb.jpg`);
          const white_single_video = getAssetsUrl(`${fileName}_white_single.mp4`);
          const white_triple_video = getAssetsUrl(`${fileName}_white_triple.mp4`);
          const black_image = getAssetsUrl(`${fileName}_black.png`);
          const black_image_thumb = getAssetsUrl(`${fileName}_black_thumb.jpg`);
          const black_single_video = getAssetsUrl(`${fileName}_black_single.mp4`);
          const black_triple_video = getAssetsUrl(`${fileName}_black_triple.mp4`);

          const nftData = {
            id: parseInt(tokenId),
            name: nft.CurName,
            owner: nft.CurOwnerAddr,
            seed: nft.SeedHex,
            white_image,
            white_image_thumb,
            white_single_video,
            white_triple_video,
            black_image,
            black_image_thumb,
            black_single_video,
            black_triple_video,
          };

          // Store in cache
          nftCache.set(tokenId, nftData);
          // Remove from pending
          pendingRequests.delete(tokenId);
          
          return nftData;
        })();

        // Store the promise
        pendingRequests.set(tokenId, requestPromise);
        
        const nftData = await requestPromise;
        setNft(nftData);
      } catch (err) {
        console.log(err);
        pendingRequests.delete(tokenId);
      }
    };

    if (contract != null && tokenId != null) {
      getNFT();
    }
  }, [contract, tokenId]);

  return nft;
};

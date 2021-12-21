import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { NFT_ADDRESS } from "../config/app";
import marketABI from "../contracts/Market.json";
import nftABI from "../contracts/NFT.json";
import useMarketContract from "./useMarketContract";
import useNFTContract from "./useNFTContract";

export const useTransactions = () => {
  const marketContract = useMarketContract();
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const iface = new ethers.utils.Interface(marketABI);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let blockNumber = await marketContract.provider.getBlockNumber();
        let block = await marketContract.provider.getBlock(blockNumber);
        let filteredTransactions = [];
        while (currentTimestamp - 86400 < block.timestamp) {
          const filteredEvents = await marketContract.queryFilter(
            {
              topics: [iface.getEventTopic("ItemBought")],
              address: NFT_ADDRESS
            },
            blockNumber - 10000,
            blockNumber
          );
          filteredTransactions = filteredTransactions.concat(filteredEvents);
          blockNumber -= 10000;
          block = await marketContract.provider.getBlock(blockNumber);
        }
        setTransactions(filteredTransactions);
      } catch (err) {
        console.log(err);
      }
    };

    getTransactions();
  }, [marketContract]);

  return transactions;
};

export const useBlock = (nft) => {
  const nftContract = useNFTContract();
  const [block, setBlock] = useState(null);

  useEffect(() => {
    const getBlock = async () => {
      try {
        const iface = new ethers.utils.Interface(nftABI);
        let blockNumber = await nftContract.provider.getBlockNumber();
        while (1) {
          const filteredEvents = await nftContract.queryFilter(
            {
              topics: [
                iface.getEventTopic("MintEvent"),
                ethers.utils.hexZeroPad(nft.id, 32),
                ethers.utils.hexZeroPad(nft.owner, 32)
              ],
              address: NFT_ADDRESS
            },
            blockNumber - 10000,
            blockNumber
          );
          if (filteredEvents.length > 0) {
            setBlock(await filteredEvents[0].getBlock());
            break;
          }
          blockNumber -= 10000;
        }
      } catch (err) {
        console.log(err);
      }
    };

    getBlock();
    console.log(block);
  }, [block, nft.id, nft.owner, nftContract]);

  return block;
};

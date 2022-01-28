import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { NFT_ADDRESS } from "../config/app";
import marketABI from "../contracts/Market.json";
import useMarketContract from "./useMarketContract";

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

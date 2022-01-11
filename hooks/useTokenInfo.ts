import { useState, useEffect } from "react";
import axios from "axios";

export function useTokenPrice(tokenId = "ethereum") : number {
  const [marketPrice, setMarketPrice] = useState(0);
  useEffect(() => {
    const getMarketPrice = async () => {
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
        );
        setMarketPrice(res.data[tokenId].usd);
      } catch (error) {
        console.log("err: ", error);
      }
    };
    getMarketPrice();
  }, [tokenId]);
  return marketPrice;
}

import MARKET_ABI from "../contracts/Market.json";
import type { Market } from "../contracts/types";
import useContract from "./useContract";

export default function useMarketContract(address?: string) {
  return useContract<Market>(address, MARKET_ABI);
}

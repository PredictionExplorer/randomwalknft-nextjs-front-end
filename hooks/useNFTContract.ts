import NFT_ABI from "../contracts/NFT.json";
import type { NFT } from "../contracts/types";
import useContract from "./useContract";

export default function useNFTContract(address?: string) {
  return useContract<NFT>(address, NFT_ABI);
}

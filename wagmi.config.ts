import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "viem";

import marketAbi from "./contracts/Market.json";
import nftAbi from "./contracts/NFT.json";

export default defineConfig({
  out: "src/generated/wagmi.ts",
  contracts: [
    {
      name: "Nft",
      abi: nftAbi as Abi,
      address: {
        42161: "0x895a6F444BE4ba9d124F61DF736605792B35D66b"
      }
    },
    {
      name: "Market",
      abi: marketAbi as Abi,
      address: {
        42161: "0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08"
      }
    }
  ],
  plugins: [react()]
});

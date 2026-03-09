"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { Countdown } from "@/components/common/countdown";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReadNftGetMintPrice, useReadNftTimeUntilSale, useReadNftWithdrawalAmount, useWriteNftMint } from "@/generated/wagmi";
import { NFT_ADDRESS, MARKET_ADDRESS } from "@/lib/config";
import { getErrorMessage } from "@/lib/web3/errors";
import { publicClient } from "@/lib/web3/public-client";
import { createAssetUrls } from "@/lib/utils";

export function MintExperience({ featuredIds }: { featuredIds: number[] }) {
  const router = useRouter();
  const { data: mintPrice } = useReadNftGetMintPrice();
  const { data: withdrawalAmount } = useReadNftWithdrawalAmount();
  const { data: saleSeconds } = useReadNftTimeUntilSale();
  const { writeContractAsync, data: hash, isPending } = useWriteNftMint();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  useEffect(() => {
    if (!hash || !isSuccess) {
      return;
    }

    startTransition(async () => {
      const totalSupply = (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: (await import("@/generated/wagmi")).nftAbi,
        functionName: "totalSupply"
      })) as bigint;
      const tokenId = Number(totalSupply) - 1;
      toast.success("Mint complete.");
      router.push(`/detail/${tokenId}` as Route);
    });
  }, [hash, isSuccess, router]);

  const isSaleOpen = !saleSeconds || Number(saleSeconds) <= 0 || countdownCompleted;
  const mintPriceEth = mintPrice ? Number(mintPrice) / 1e18 : 0;
  const withdrawalEth = withdrawalAmount ? Number(withdrawalAmount) / 1e18 : 0;

  const handleMint = async () => {
    try {
      if (!isSaleOpen || mintPriceEth <= 0) {
        toast.error("The sale is not open yet.");
        return;
      }

      await writeContractAsync({
        value: parseEther(mintPriceEth.toFixed(6))
      });
      toast.info("Mint transaction submitted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageShell className="space-y-10 py-16">
      <PageHeading
        title={
          isSaleOpen
            ? [
                { text: "GET A" },
                { text: "RANDOM WALK", tone: "primary" },
                { text: `NFT FOR ${mintPriceEth.toFixed(4)} ETH`, tone: "secondary" }
              ]
            : [
                { text: "SALE" },
                { text: "OPENS IN", tone: "primary" }
              ]
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-8">
          {!isSaleOpen && saleSeconds ? (
            <Countdown seconds={Number(saleSeconds)} onComplete={() => setCountdownCompleted(true)} />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal to mint ratio</CardTitle>
              </CardHeader>
              <CardContent>{mintPriceEth > 0 ? (withdrawalEth / mintPriceEth).toFixed(2) : "0.00"}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Verified contracts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>
                  NFT:
                  {" "}
                  <a href={`https://arbiscan.io/address/${NFT_ADDRESS}#code`} target="_blank" className="text-secondary">
                    {NFT_ADDRESS}
                  </a>
                </div>
                <div>
                  Market:
                  {" "}
                  <a href={`https://arbiscan.io/address/${MARKET_ADDRESS}#code`} target="_blank" className="text-secondary">
                    {MARKET_ADDRESS}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleMint} disabled={isPending || !isSaleOpen} size="lg">
            {isPending ? "Minting..." : "Mint now"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {featuredIds.map((id) => (
            <NftCard key={id} id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

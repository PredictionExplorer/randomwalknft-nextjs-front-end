"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Countdown } from "@/components/common/countdown";
import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { useReadNftGetMintPrice, useReadNftTimeUntilSale, useReadNftWithdrawalAmount, useWriteNftMint } from "@/generated/wagmi";
import { NFT_ADDRESS, MARKET_ADDRESS } from "@/lib/config";
import { getErrorMessage } from "@/lib/web3/errors";
import { publicClient } from "@/lib/web3/public-client";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { arbiscanContractUrl, createAssetUrls } from "@/lib/utils";

export function MintExperience({ featuredIds }: { featuredIds: number[] }) {
  const router = useRouter();
  const { isConnected, isReady, chain } = useWalletStatus();
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
      trackEvent("transaction_confirmed", {
        tokenId,
        flow: "mint"
      });
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

      trackEvent("transaction_submitted", {
        flow: "mint",
        connected: isConnected,
        chainId: chain?.id
      });
      await writeContractAsync({
        value: parseEther(mintPriceEth.toFixed(6))
      });
      toast.info("Mint transaction submitted.");
    } catch (error) {
      trackEvent("transaction_failed", {
        flow: "mint",
        message: getErrorMessage(error)
      });
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageShell className="space-y-10 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Mint" }
        ]}
      />
      <PageHeading
        eyebrow="Collector mint"
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

      {!isReady ? (
        <WalletStatusCard
          disconnectedTitle="Connect to mint"
          disconnectedBody="Minting starts with an Arbitrum wallet. Connect first so the site can prepare the transaction and guide you through confirmation."
          wrongNetworkBody="Your wallet is connected on the wrong network. Switch to Arbitrum to mint the next Random Walk NFT."
        />
      ) : null}

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
                  <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="text-secondary">
                    {NFT_ADDRESS}
                  </ExternalLink>
                </div>
                <div>
                  Market:
                  {" "}
                  <ExternalLink href={arbiscanContractUrl(MARKET_ADDRESS)} className="text-secondary">
                    {MARKET_ADDRESS}
                  </ExternalLink>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleMint} disabled={isPending || !isSaleOpen} size="lg">
            {isPending ? "Minting..." : "Mint now"}
          </Button>

          <div id="how-it-works" className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Mint the seed",
                body: "The transaction creates the on-chain seed that defines the artwork and motion outputs."
              },
              {
                title: "Generate the media",
                body: "The seed is rendered into a still image plus motion studies that become part of the collector experience."
              },
              {
                title: "Stay in the incentive loop",
                body: "If mint activity pauses for 30 days, the latest minter can redeem half of the mint pool."
              }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="space-y-3 p-5">
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {featuredIds.map((id) => (
            <NftCard key={id} id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} />
          ))}
        </div>
      </div>

      <Card className="bg-card/70">
        <CardContent className="grid gap-5 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">Why collectors mint</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Minting secures the next seed, starts the media-generation process, and puts collectors directly inside the collection’s economic loop.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">What you receive</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Each NFT is a CC0 on-chain token paired with a still image and motion variants derived from the same seed.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">Proof and trust</p>
            <p className="text-sm leading-7 text-muted-foreground">
              The NFT and marketplace contracts are verified on Arbiscan, keeping collector due diligence straightforward.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { formatEther } from "viem";
import { usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { NFT_ADDRESS, MARKET_ADDRESS } from "@/lib/config";
import { nftAbi, useReadNftGetMintPrice, useReadNftTimeUntilSale, useReadNftWithdrawalAmount, useWriteNftMint } from "@/generated/wagmi";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Countdown } from "@/components/common/countdown";
import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftCard } from "@/components/nft/nft-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { getErrorMessage } from "@/lib/web3/errors";
import { applyBasisPointsBuffer, prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { arbiscanContractUrl, createAssetUrls } from "@/lib/utils";

const MINT_VALUE_BUFFER_BPS = 10_025n;

export function MintExperience({ featuredIds }: { featuredIds: number[] }) {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { address, isConnected, isReady, chain } = useWalletStatus();
  const { data: mintPrice } = useReadNftGetMintPrice();
  const { data: withdrawalAmount } = useReadNftWithdrawalAmount();
  const { data: saleSeconds } = useReadNftTimeUntilSale();
  const { writeContractAsync, data: hash, isPending } = useWriteNftMint();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  useEffect(() => {
    if (!hash || !isSuccess || !publicClient) {
      return;
    }

    startTransition(async () => {
      const totalSupply = (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })) as bigint;
      const tokenId = Number(totalSupply) - 1;
      toast.success("Mint complete.");
      trackEvent("transaction_confirmed", {
        tokenId,
        flow: "mint"
      });
      router.push(`/detail/${tokenId}?message=success` as Route);
    });
  }, [hash, isSuccess, publicClient, router]);

  const isSaleOpen = !saleSeconds || Number(saleSeconds) <= 0 || countdownCompleted;
  const mintPriceEth = mintPrice ? Number(formatEther(mintPrice)) : 0;
  const withdrawalEth = withdrawalAmount ? Number(formatEther(withdrawalAmount)) : 0;

  const handleMint = async () => {
    try {
      if (!isSaleOpen || mintPriceEth <= 0) {
        toast.error("The sale is not open yet.");
        return;
      }

      if (!publicClient || !address) {
        toast.error("Connect your wallet to mint.");
        return;
      }

      const latestMintPrice = (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "getMintPrice"
      })) as bigint;
      const mintValue = applyBasisPointsBuffer(latestMintPrice, MINT_VALUE_BUFFER_BPS);
      const { gas } = await prepareContractWrite({
        publicClient,
        account: address,
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "mint",
        value: mintValue
      });

      trackEvent("transaction_submitted", {
        flow: "mint",
        connected: isConnected,
        chainId: chain?.id
      });
      await writeContractAsync({
        value: mintValue,
        gas
      });
      toast.info("Mint transaction submitted.");
    } catch (error) {
      trackEvent("transaction_failed", {
        flow: "mint",
        message: getErrorMessage(error)
      });
      showWalletError(error);
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
        eyebrow="Mint a new NFT"
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
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect an Arbitrum wallet to mint. The site will prepare the transaction for you to confirm."
          wrongNetworkBody="Your wallet is on the wrong network. Switch to Arbitrum to continue."
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

          <button
            type="button"
            onClick={handleMint}
            disabled={isPending || !isSaleOpen}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#9b4aaf] bg-[#9b4aaf] px-7 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(155,74,175,0.5)] transition hover:bg-[#8a3f9d] hover:shadow-[0_0_32px_rgba(155,74,175,0.65)] disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? "Minting..." : "Mint now"}
          </button>
          <p className="text-sm text-muted-foreground">
            The app sends a small refundable buffer on mint so price changes while you sign are less likely to cause a failure.
          </p>

          <div id="how-it-works" className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Mint your token",
                body: "Your transaction creates a unique on-chain seed that will be used to generate your artwork."
              },
              {
                title: "2. Art is generated",
                body: "Within minutes, the seed produces a high-resolution image and multiple video variants — all unique to your token."
              },
              {
                title: "3. Earn from the pool",
                body: "If no one mints for 30 days, the last minter can claim half the ETH in the mint pool."
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
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">Why mint?</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Each mint adds a new unique work to the collection, contributes to the shared pool, and gives you a chance to earn if minting pauses.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">What you get</p>
            <p className="text-sm leading-7 text-muted-foreground">
              A CC0 on-chain token with a unique still image and multiple video variants, all generated from one seed.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">Verified and transparent</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Both the NFT and marketplace contracts are verified on Arbiscan — inspect every rule before you transact.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

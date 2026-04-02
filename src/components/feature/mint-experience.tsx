"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { encodeFunctionData, formatEther, getAddress } from "viem";
import { usePublicClient, useReadContract, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { useContracts } from "@/components/providers/contracts-context";
import { nftAbi } from "@/generated/wagmi";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Countdown } from "@/components/common/countdown";
import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftCard } from "@/components/nft/nft-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { getErrorMessage } from "@/lib/web3/errors";
import {
  applyBasisPointsBuffer,
  estimateBufferedTransactionFees
} from "@/lib/web3/transaction-preflight";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { arbiscanContractUrl, createAssetUrls } from "@/lib/utils";
import {
  getChainDisplayName,
  getConfiguredEvmChain,
  getCurrentNetworkName,
  getRpcHttpUrl
} from "@/lib/web3/evm-chain";

const MINT_VALUE_BUFFER_BPS = 10_025n;

/** First contract from `npx hardhat node` + default deploy — used only to warn on `local` if API drifts. */
const LOCAL_HARDHAT_DEFAULT_RW_NFT = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export function MintExperience({ featuredIds }: { featuredIds: number[] }) {
  const { MARKET_ADDRESS, NFT_ADDRESS } = useContracts();
  const router = useRouter();
  const publicClient = usePublicClient();
  const configuredChain = getConfiguredEvmChain();
  const configuredChainId = configuredChain.id;
  const { data: walletClient } = useWalletClient({ chainId: configuredChainId });
  const { address, isConnected, isReady, chain, isWrongNetwork } = useWalletStatus();
  const { data: mintPrice, isLoading: isMintPriceLoading } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "getMintPrice"
  });
  const { data: withdrawalAmount } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "withdrawalAmount"
  });
  const { data: saleSeconds } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "timeUntilSale"
  });
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>();
  const [isMinting, setIsMinting] = useState(false);
  const { isSuccess: mintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  useEffect(() => {
    if (!mintTxHash || !mintConfirmed || !publicClient) {
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
  }, [mintTxHash, mintConfirmed, publicClient, router, NFT_ADDRESS]);

  const isSaleOpen = !saleSeconds || Number(saleSeconds) <= 0 || countdownCompleted;
  const mintPriceEth = mintPrice != null ? Number(formatEther(mintPrice)) : 0;
  const withdrawalEth = withdrawalAmount ? Number(formatEther(withdrawalAmount)) : 0;

  const handleMint = async () => {
    try {
      if (isMintPriceLoading || saleSeconds === undefined) {
        toast.error("Loading contract data…");
        return;
      }
      if (!isSaleOpen) {
        toast.error("The sale is not open yet.");
        return;
      }
      if (mintPriceEth <= 0) {
        toast.error("Mint price is unavailable or zero. Check the NFT contract on this network.");
        return;
      }

      if (!publicClient || !address) {
        toast.error("Connect your wallet to mint.");
        return;
      }
      if (!isReady || isWrongNetwork) {
        toast.error(`Switch your wallet to ${getChainDisplayName()} (chain id ${configuredChainId}) before minting.`);
        return;
      }
      if (!walletClient) {
        toast.error("Wallet client not ready. Reconnect your wallet and try again.");
        return;
      }

      setIsMinting(true);
      const nftTarget = getAddress(NFT_ADDRESS);
      if (
        getCurrentNetworkName() === "local" &&
        nftTarget.toLowerCase() !== LOCAL_HARDHAT_DEFAULT_RW_NFT.toLowerCase()
      ) {
        toast.warning(
          `NFT from API is ${nftTarget}; stock Hardhat RandomWalkNFT is often ${LOCAL_HARDHAT_DEFAULT_RW_NFT}. If mint fails in MetaMask, align rw_contracts and wallet RPC (${getRpcHttpUrl()}).`
        );
      }

      const latestMintPrice = (await publicClient.readContract({
        address: nftTarget,
        abi: nftAbi,
        functionName: "getMintPrice"
      })) as bigint;
      const mintValue = applyBasisPointsBuffer(latestMintPrice, MINT_VALUE_BUFFER_BPS);

      const mintCalldata = encodeFunctionData({
        abi: nftAbi,
        functionName: "mint",
        args: []
      });

      // Validate on the app’s RPC (same as reads). MetaMask uses its own RPC — if they differ, MM can revert while this passes.
      await publicClient.simulateContract({
        address: nftTarget,
        abi: nftAbi,
        functionName: "mint",
        args: [],
        account: address,
        value: mintValue,
        chain: configuredChain
      });

      trackEvent("transaction_submitted", {
        flow: "mint",
        connected: isConnected,
        chainId: chain?.id
      });
      const feeFields = await estimateBufferedTransactionFees(publicClient);
      // Explicit to + data: some wallets mishandle writeContract(request) serialization.
      const submittedHash = await walletClient.sendTransaction({
        account: address,
        chain: configuredChain,
        to: nftTarget,
        data: mintCalldata,
        value: mintValue,
        ...feeFields
      });
      setMintTxHash(submittedHash);
      toast.info("Mint transaction submitted.");
    } catch (error) {
      const errMsg = getErrorMessage(error);
      trackEvent("transaction_failed", {
        flow: "mint",
        message: errMsg
      });
      if (
        getCurrentNetworkName() === "local" &&
        process.env.NODE_ENV === "development" &&
        errMsg.toLowerCase().includes("selector")
      ) {
        toast.error(
          `MetaMask reverted — it is likely using a different RPC than this app. Set the wallet’s network RPC to ${getRpcHttpUrl()} (chain id ${configuredChainId}). The tx \`to\` is your API’s NFT (${NFT_ADDRESS}); that address must be RandomWalkNFT on the same node as this RPC.`
        );
      }
      showWalletError(error);
    } finally {
      setIsMinting(false);
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
          disconnectedBody={`Connect a wallet on ${getChainDisplayName()} to mint. The site will prepare the transaction for you to confirm.`}
          wrongNetworkBody={`Your wallet is on the wrong network. Switch to ${getChainDisplayName()} to continue.`}
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
            disabled={
              isMinting || !isSaleOpen || isMintPriceLoading || mintPrice == null || !isReady
            }
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#9b4aaf] bg-[#9b4aaf] px-7 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(155,74,175,0.5)] transition hover:bg-[#8a3f9d] hover:shadow-[0_0_32px_rgba(155,74,175,0.65)] disabled:pointer-events-none disabled:opacity-50"
          >
            {isMinting ? "Minting..." : "Mint now"}
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

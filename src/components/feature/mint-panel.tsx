"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, formatEther, getAddress } from "viem";
import { usePublicClient, useReadContract, useWaitForTransactionReceipt } from "wagmi";

import { Countdown } from "@/components/common/countdown";
import { MintRevealTheater } from "@/components/feature/mint-reveal-theater";
import { useContracts } from "@/components/providers/contracts-context";
import { Button } from "@/components/ui/button";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { nftAbi } from "@/generated/wagmi";
import { trackEvent } from "@/lib/analytics";
import type { VaultState } from "@/lib/types";
import { formatEth } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { getChainDisplayName, getConfiguredEvmChain, getCurrentNetworkName, getRpcHttpUrl } from "@/lib/web3/evm-chain";
import { applyBasisPointsBuffer, estimateBufferedTransactionFees } from "@/lib/web3/transaction-preflight";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { showWalletError } from "@/lib/web3/wallet-toast";

const MINT_VALUE_BUFFER_BPS = 10_025n;

/** First contract from `npx hardhat node` + default deploy — used only to warn on `local` if API drifts. */
const LOCAL_HARDHAT_DEFAULT_RW_NFT = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

type MintPanelProps = {
  /** Server-read vault for a meaningful first paint before the wallet's RPC answers. */
  initialVault: VaultState | null;
};

/**
 * The ticket desk: live price, what is at stake, and the one button. Simulates the
 * mint on the app's RPC before asking the wallet to sign, then hands off to the
 * reveal once the receipt lands.
 */
export function MintPanel({ initialVault }: MintPanelProps) {
  const { NFT_ADDRESS } = useContracts();
  const router = useRouter();
  const publicClient = usePublicClient();
  const configuredChain = getConfiguredEvmChain();
  const {
    address,
    canTransact,
    isConnected,
    isReady,
    isWalletClientFetching,
    chain,
    isWrongNetwork,
    refetchWalletClient,
    walletClient
  } = useWalletStatus();
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
  const [reveal, setReveal] = useState<{ tokenId: number; seed: string } | null>(null);

  useEffect(() => {
    if (!mintTxHash || !mintConfirmed || !publicClient) {
      return;
    }

    startTransition(async () => {
      const totalSupply = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      });
      const tokenId = Number(totalSupply) - 1;
      toast.success("Mint complete.");
      trackEvent("transaction_confirmed", { tokenId, flow: "mint" });

      // Reveal theater: draw the new work live from its on-chain seed while the
      // backend renders the full media. Falls back to a direct redirect if the
      // seed read fails.
      try {
        const seed = await publicClient.readContract({
          address: NFT_ADDRESS,
          abi: nftAbi,
          functionName: "seeds",
          args: [BigInt(tokenId)]
        });
        setReveal({ tokenId, seed });
      } catch {
        router.push(`/detail/${tokenId}?message=success` as Route);
      }
    });
  }, [mintTxHash, mintConfirmed, publicClient, router, NFT_ADDRESS]);

  const isSaleOpen = !saleSeconds || Number(saleSeconds) <= 0 || countdownCompleted;
  const mintPriceEth = mintPrice != null ? Number(formatEther(mintPrice)) : (initialVault?.mintPriceEth ?? 0);
  const prizeShareEth = withdrawalAmount ? Number(formatEther(withdrawalAmount)) : (initialVault?.prizeEth ?? 0) / 2;
  const ratio = mintPriceEth > 0 ? Math.round(prizeShareEth / mintPriceEth) : null;

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
        toast.error(`Switch your wallet to ${getChainDisplayName()} (chain id ${configuredChain.id}) before minting.`);
        return;
      }
      let activeWalletClient = walletClient;
      if (!activeWalletClient) {
        const refreshedWalletClient = await refetchWalletClient();
        activeWalletClient = refreshedWalletClient.data;
      }
      if (!activeWalletClient) {
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

      const latestMintPrice = await publicClient.readContract({
        address: nftTarget,
        abi: nftAbi,
        functionName: "getMintPrice"
      });
      const mintValue = applyBasisPointsBuffer(latestMintPrice, MINT_VALUE_BUFFER_BPS);
      const mintCalldata = encodeFunctionData({ abi: nftAbi, functionName: "mint", args: [] });

      // Validate on the app's RPC (same as reads). Wallets use their own RPC — if they differ, they can revert while this passes.
      await publicClient.simulateContract({
        address: nftTarget,
        abi: nftAbi,
        functionName: "mint",
        args: [],
        account: address,
        value: mintValue,
        chain: configuredChain
      });

      trackEvent("transaction_submitted", { flow: "mint", connected: isConnected, chainId: chain?.id });
      const feeFields = await estimateBufferedTransactionFees(publicClient);
      // Explicit to + data: some wallets mishandle writeContract(request) serialization.
      const submittedHash = await activeWalletClient.sendTransaction({
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
      trackEvent("transaction_failed", { flow: "mint", message: errMsg });
      if (
        getCurrentNetworkName() === "local" &&
        process.env.NODE_ENV === "development" &&
        errMsg.toLowerCase().includes("selector")
      ) {
        toast.error(
          `MetaMask reverted — it is likely using a different RPC than this app. Set the wallet's network RPC to ${getRpcHttpUrl()} (chain id ${configuredChain.id}). The tx \`to\` is your API's NFT (${NFT_ADDRESS}); that address must be RandomWalkNFT on the same node as this RPC.`
        );
      }
      showWalletError(error);
    } finally {
      setIsMinting(false);
    }
  };

  const awaitingReceipt = mintTxHash !== undefined && !mintConfirmed;

  return (
    <div className="space-y-6" data-testid="mint-panel">
      {reveal ? (
        <MintRevealTheater
          tokenId={reveal.tokenId}
          seed={reveal.seed}
          onView={() => router.push(`/detail/${reveal.tokenId}?message=success` as Route)}
        />
      ) : null}

      {!isSaleOpen && saleSeconds ? (
        <div className="space-y-2">
          <p className="eyebrow">The sale opens in</p>
          <Countdown seconds={Number(saleSeconds)} onComplete={() => setCountdownCompleted(true)} />
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="bg-background p-5">
          <dt className="eyebrow">Mint price</dt>
          <dd className="font-display mt-2 text-3xl tabular-nums sm:text-4xl" data-testid="mint-price">
            {mintPriceEth > 0 ? formatEth(mintPriceEth) : "—"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">Rises about 0.1% after every mint · gas under $0.10</dd>
        </div>
        <div className="bg-background p-5">
          <dt className="eyebrow text-accent">The key is worth</dt>
          <dd className="font-display mt-2 text-3xl tabular-nums text-accent sm:text-4xl">
            {prizeShareEth > 0 ? formatEth(prizeShareEth, 2) : "—"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            Half the vault, to the keyholder after 30 quiet days{ratio ? ` · ${ratio}× the mint price` : ""}
          </dd>
        </div>
      </dl>

      {!isReady ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody={`Connect a wallet on ${getChainDisplayName()} to mint. The site prepares the transaction for you to confirm.`}
          wrongNetworkBody={`Your wallet is on the wrong network. Switch to ${getChainDisplayName()} to continue.`}
        />
      ) : null}

      <div className="space-y-3">
        <Button
          size="lg"
          variant="accent"
          onClick={handleMint}
          disabled={
            isMinting || awaitingReceipt || !isSaleOpen || isMintPriceLoading || mintPrice == null || !canTransact
          }
          className="h-14 w-full text-base sm:w-auto sm:px-10"
          data-testid="mint-button"
        >
          <KeyRound className="h-4 w-4" aria-hidden />
          {isMinting
            ? "Waiting for your signature…"
            : awaitingReceipt
              ? "Confirming on Arbitrum…"
              : isReady && isWalletClientFetching
                ? "Preparing wallet…"
                : `Mint · take the key${mintPriceEth > 0 ? ` · ${mintPriceEth.toFixed(4)} ETH` : ""}`}
        </Button>
        <p className="text-xs leading-6 text-muted-foreground">
          The transaction is simulated first and sent with a 0.25% price buffer so a mint that lands just after someone
          else&apos;s still succeeds. The contract refunds any excess.
        </p>
      </div>
    </div>
  );
}

"use client";

import { zeroAddress } from "viem";
import { usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Countdown } from "@/components/common/countdown";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { trackEvent } from "@/lib/analytics";
import { useContracts } from "@/components/providers/contracts-context";
import { nftAbi } from "@/generated/wagmi";
import { formatDateTimeFromUnix, formatEth } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { getChainDisplayName } from "@/lib/web3/evm-chain";

export function RedeemExperience() {
  const { NFT_ADDRESS } = useContracts();
  const publicClient = usePublicClient();
  const { address, isReady } = useWalletStatus();
  const { data: withdrawalSeconds } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "timeUntilWithdrawal"
  });
  const {
    data: lastMinter,
    isLoading: lastMinterLoading,
    isError: lastMinterFailed
  } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "lastMinter"
  });
  const { data: withdrawalAmount } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "withdrawalAmount"
  });
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const seconds = Number(withdrawalSeconds ?? 0n);
  const amount = Number(withdrawalAmount ?? 0n) / 1e18;

  if (isSuccess) {
    toast.success("Withdrawal completed.");
  }

  return (
    <PageShell className="space-y-10 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Redeem" }
        ]}
      />
      <PageHeading
        eyebrow="Mint pool withdrawal"
        title={
          seconds > 0
            ? [
                { text: "WITHDRAWAL" },
                { text: "OPENS IN", tone: "primary" }
              ]
            : [
                { text: "WITHDRAWAL" },
                { text: "IS OPEN", tone: "primary" }
              ]
        }
      />

      {!isReady ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect your wallet to check if you are eligible for the withdrawal. Only the most recent minter qualifies."
          wrongNetworkBody={`Switch to ${getChainDisplayName()} to check eligibility and withdraw.`}
        />
      ) : null}

      {seconds > 0 ? <Countdown seconds={seconds} /> : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Last minter</CardTitle>
          </CardHeader>
          <CardContent>
            {lastMinterLoading ? (
              <span className="text-muted-foreground">Loading…</span>
            ) : lastMinterFailed ? (
              <span
                className="text-sm text-muted-foreground"
                title="Often: NEXT_PUBLIC_RPC_URL is Ethereum Sepolia while this app uses Arbitrum Sepolia (421614), or the deployed contract has no lastMinter()."
              >
                Unavailable (RPC / contract mismatch)
              </span>
            ) : lastMinter && lastMinter !== zeroAddress ? (
              <a href={`/gallery?address=${lastMinter}`} className="text-secondary">
                {lastMinter}
              </a>
            ) : (
              <span className="text-muted-foreground">None yet (no minter recorded)</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal date</CardTitle>
          </CardHeader>
          <CardContent>{formatDateTimeFromUnix(Math.floor(Date.now() / 1000) + seconds)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal amount</CardTitle>
          </CardHeader>
          <CardContent>{formatEth(amount, 1)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            If 30 days pass without a new mint, the most recent minter becomes eligible to withdraw half the ETH in the mint pool. The other half remains in the contract for future collectors.
          </p>
          <Button
            onClick={async () => {
              try {
                if (!publicClient || !address) {
                  throw new Error("Connect your wallet to continue.");
                }

                const prepared = await prepareContractWrite({
                  publicClient,
                  account: address,
                  address: NFT_ADDRESS,
                  abi: nftAbi,
                  functionName: "withdraw"
                });

                trackEvent("transaction_submitted", {
                  flow: "redeem"
                });
                await writeContractAsync({
                  address: NFT_ADDRESS,
                  abi: nftAbi,
                  functionName: "withdraw",
                  ...prepared
                });
              } catch (error) {
                trackEvent("transaction_failed", {
                  flow: "redeem",
                  message: getErrorMessage(error)
                });
                showWalletError(error);
              }
            }}
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Withdraw now"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
                title: "Why this exists",
                body: "The withdrawal mechanism ensures ETH flows back to active participants, not the project creator."
              },
              {
                title: "Who qualifies",
                body: "Only the most recent minter at the time the 30-day window expires. No one else can claim the withdrawal."
              },
              {
                title: "What happens after",
                body: "Half the mint pool is withdrawn. The remaining half stays in the contract, maintaining the incentive for the next cycle."
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
    </PageShell>
  );
}

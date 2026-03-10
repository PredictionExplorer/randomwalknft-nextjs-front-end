"use client";

import { usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Countdown } from "@/components/common/countdown";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { trackEvent } from "@/lib/analytics";
import { NFT_ADDRESS } from "@/lib/config";
import { nftAbi, useReadNftLastMinter, useReadNftTimeUntilWithdrawal, useReadNftWithdrawalAmount, useWriteNftWithdraw } from "@/generated/wagmi";
import { formatDateTimeFromUnix, formatEth } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

export function RedeemExperience() {
  const publicClient = usePublicClient();
  const { address, isReady } = useWalletStatus();
  const { data: withdrawalSeconds } = useReadNftTimeUntilWithdrawal();
  const { data: lastMinter } = useReadNftLastMinter();
  const { data: withdrawalAmount } = useReadNftWithdrawalAmount();
  const { writeContractAsync, data: hash, isPending } = useWriteNftWithdraw();
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
          wrongNetworkBody="Switch to Arbitrum to check eligibility and withdraw."
        />
      ) : null}

      {seconds > 0 ? <Countdown seconds={seconds} /> : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Last minter</CardTitle>
          </CardHeader>
          <CardContent>
            {lastMinter ? (
              <a href={`/gallery?address=${lastMinter}`} className="text-secondary">
                {lastMinter}
              </a>
            ) : (
              "Unknown"
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

                const { gas } = await prepareContractWrite({
                  publicClient,
                  account: address,
                  address: NFT_ADDRESS,
                  abi: nftAbi,
                  functionName: "withdraw"
                });

                trackEvent("transaction_submitted", {
                  flow: "redeem"
                });
                await writeContractAsync({ gas });
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

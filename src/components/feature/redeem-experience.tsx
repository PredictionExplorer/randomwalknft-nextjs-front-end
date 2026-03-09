"use client";

import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { Countdown } from "@/components/common/countdown";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReadNftLastMinter, useReadNftTimeUntilWithdrawal, useReadNftWithdrawalAmount, useWriteNftWithdraw } from "@/generated/wagmi";
import { formatDateTimeFromUnix, formatEth } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";

export function RedeemExperience() {
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
      <PageHeading
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
            If nobody mints for 30 days after the last mint, the last minter can withdraw half of all ETH spent on minting up to that point. That keeps value cycling back to minters rather than the creator.
          </p>
          <Button
            onClick={async () => {
              try {
                await writeContractAsync({});
              } catch (error) {
                toast.error(getErrorMessage(error));
              }
            }}
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Withdraw now"}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}

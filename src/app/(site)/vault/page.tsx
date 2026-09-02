import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { VaultExperience } from "@/components/feature/vault-experience";
import { nftAbi } from "@/generated/wagmi";
import { getVaultState } from "@/lib/api/public";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl } from "@/lib/utils";
import { getPublicClient } from "@/lib/web3/public-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "The Vault — the prize pool that pays the last minter",
  description:
    "Every Random Walk NFT mint adds ETH to the Vault. If 30 days pass without a new mint, the most recent minter can withdraw half the pool. Watch the live prize, the countdown, and the current keyholder.",
  alternates: { canonical: "/vault" },
  openGraph: {
    title: "The Vault | Random Walk NFT",
    description:
      "The on-chain prize pool of Random Walk NFT: if nobody mints for 30 days, the last minter claims half the ETH inside."
  }
};

async function getKeyholderLatestTokenId(lastMinter: string | undefined): Promise<number | undefined> {
  if (!lastMinter) {
    return undefined;
  }
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const owned = (await getPublicClient().readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "walletOfOwner",
      args: [lastMinter as `0x${string}`]
    })) as bigint[];
    if (owned.length === 0) {
      return undefined;
    }
    return Number(owned.reduce((max, id) => (id > max ? id : max), owned[0]!));
  } catch {
    return undefined;
  }
}

export default async function VaultPage() {
  const { NFT_ADDRESS } = await getAppConfig();
  const vault = await getVaultState();
  const keyholderTokenId = await getKeyholderLatestTokenId(vault?.lastMinter);

  const launchedYearsAgo = new Date().getUTCFullYear() - 2021;
  const ratio =
    vault?.mintPriceEth && vault.mintPriceEth > 0 ? Math.round(vault.prizeEth / vault.mintPriceEth) : undefined;

  return (
    <PageShell className="space-y-12 py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "The Vault" }]} />
      <PageHeading
        eyebrow="The clock room"
        title="The Vault"
        description="Every mint pays into a vault inside the contract. The most recent minter holds the only key. If 30 days pass without a new mint, the keyholder may withdraw half of everything inside — and any new mint resets the clock and takes the key."
      />

      {vault ? (
        <VaultExperience initialVault={vault} keyholderTokenId={keyholderTokenId} />
      ) : (
        <p className="rounded-md border border-border p-6 text-sm leading-7 text-muted-foreground">
          Live vault data is temporarily unavailable. The rules still apply on-chain: every mint feeds the pool, and the
          last minter can withdraw half of it after 30 days without a new mint. Check the contract directly on{" "}
          <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="text-foreground">
            Arbiscan
          </ExternalLink>
          .
        </p>
      )}

      <section className="space-y-8 border-t border-border pt-12" aria-labelledby="vault-rules-heading">
        <div className="space-y-3">
          <p className="eyebrow text-accent">The rules</p>
          <h2 id="vault-rules-heading" className="font-display text-3xl sm:text-4xl">
            How does the Vault game work?
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            All ETH paid for minting goes into the contract — the creators take nothing. The mint price rises about 0.1%
            with every mint, so the pool compounds as the collection grows.
            {ratio && vault
              ? ` Today the prize is ${vault.prizeEth.toFixed(2)} ETH, roughly ${ratio}× the current mint price of ${vault.mintPriceEth?.toFixed(4)} ETH.`
              : ""}{" "}
            When a withdrawal happens, only half the pool leaves; the other half seeds the next round, so the game never
            truly ends.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {[
            {
              title: "Who holds the key",
              body: "Whoever minted most recently. Minting is the only way to take the key, and every mint hands it to the new minter while resetting the 30-day clock."
            },
            {
              title: "What the keyholder wins",
              body: "Half of all ETH in the contract, claimable only after 30 full days pass without anyone else minting. The other half stays behind for the next round."
            },
            {
              title: "Why it cannot be changed",
              body: "The contract is immutable, with no admin keys and no creator fees. Nobody — including the creators — can alter the rules or take ETH out any other way."
            }
          ].map((item) => (
            <article key={item.title} className="space-y-3 bg-background p-6">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-12" aria-labelledby="vault-history-heading">
        <p className="eyebrow text-accent">The record</p>
        <h2 id="vault-history-heading" className="font-display text-3xl sm:text-4xl">
          Has the Vault ever been opened?
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          {vault
            ? vault.numWithdrawals === 0
              ? `Never. In ${launchedYearsAgo} years and ${vault.mintedCount.toLocaleString()} mints since the collection launched in 2021, the 30-day clock has never reached zero — someone has always minted in time. The pool has only ever grown.`
              : `The vault has been opened ${vault.numWithdrawals} time${vault.numWithdrawals === 1 ? "" : "s"} since launch in 2021. Each time, half the pool was claimed and the game continued with the remainder.`
            : "The withdrawal history is recorded permanently on-chain and can be verified on Arbiscan."}{" "}
          Every rule described here is enforced by the verified contract at{" "}
          <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="break-all font-mono text-xs text-foreground">
            {NFT_ADDRESS}
          </ExternalLink>
          .
        </p>
      </section>
    </PageShell>
  );
}

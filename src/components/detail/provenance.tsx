import type { Route } from "next";
import Link from "next/link";

import { CopyButton } from "@/components/common/copy-button";
import { ExternalLink } from "@/components/common/external-link";
import type { Nft } from "@/lib/types";
import { arbiscanAddressUrl, arbiscanTokenUrl, formatDateTimeFromUnix, formatEth, shortenAddress } from "@/lib/utils";

type ProvenanceProps = {
  nft: Nft;
  contractAddress: `0x${string}`;
  /** 1 = most beautiful; undefined when unranked or the ranking is unavailable. */
  beautyRank: number | undefined;
  rankedCount: number;
};

type TimelineEvent = {
  key: string;
  title: string;
  detail: React.ReactNode;
  when: string;
};

function buildTimeline(nft: Nft): TimelineEvent[] {
  return nft.tokenHistory.map((record, index) => {
    const isMint = record.recordType === 1;
    const actor = record.buyer ?? record.owner ?? record.seller;
    return {
      key: `${record.recordType}-${record.timestamp}-${index}`,
      title: isMint ? "Minted" : record.price ? "Sold" : "Transferred",
      detail: (
        <>
          {isMint ? "by " : "to "}
          {actor ? (
            <Link href={`/gallery?address=${actor}` as Route} className="font-mono text-foreground hover:text-accent">
              {shortenAddress(actor, 6)}
            </Link>
          ) : (
            "an unknown address"
          )}
          {record.price ? ` for ${formatEth(record.price)}` : ""}
        </>
      ),
      when: formatDateTimeFromUnix(record.timestamp)
    };
  });
}

/** The museum label: who made it, who holds it, how it ranks, and how to verify all of it. */
export function Provenance({ nft, contractAddress, beautyRank, rankedCount }: ProvenanceProps) {
  const timeline = buildTimeline(nft);

  return (
    <section aria-labelledby="provenance-heading" className="space-y-8" data-testid="provenance">
      <h2 id="provenance-heading" className="eyebrow">
        Provenance
      </h2>

      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Owner</dt>
          <dd className="mt-1">
            <Link
              href={`/gallery?address=${nft.owner}` as Route}
              className="font-mono text-sm text-foreground hover:text-accent"
              title={nft.owner}
            >
              {shortenAddress(nft.owner, 6)}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Beauty rank</dt>
          <dd className="mt-1 text-sm">
            {beautyRank ? (
              <>
                <span className="font-mono text-foreground">#{beautyRank}</span>
                <span className="text-muted-foreground"> of {rankedCount.toLocaleString()} · </span>
                <Link
                  href="/compare"
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  vote in the salon
                </Link>
              </>
            ) : (
              <span className="text-muted-foreground">{nft.isPendingMetadata ? "Not yet ranked" : "Unranked"}</span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="eyebrow">On-chain seed</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-3">
            <code className="break-all font-mono text-xs leading-6 text-foreground">{nft.seed}</code>
            <CopyButton value={nft.seed} label="Copy" toastMessage="Seed copied." />
            <Link href={`/atelier?seed=${nft.seed}` as Route} className="eyebrow text-foreground hover:text-accent">
              Redraw in the Atelier →
            </Link>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Token</dt>
          <dd className="mt-1 text-sm">
            <ExternalLink
              href={arbiscanTokenUrl(contractAddress, nft.id)}
              className="font-mono text-foreground hover:text-accent"
              showIcon
            >
              #{nft.id} on Arbiscan
            </ExternalLink>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Contract</dt>
          <dd className="mt-1 text-sm">
            <ExternalLink
              href={arbiscanAddressUrl(contractAddress)}
              className="font-mono text-foreground hover:text-accent"
              showIcon
            >
              {shortenAddress(contractAddress, 6)}
            </ExternalLink>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="eyebrow">Licence</dt>
          <dd className="mt-1 text-sm leading-6 text-muted-foreground">
            CC0 public domain. The image and films are free for anyone to use; what you own on-chain is the token: the
            seed, the provenance, the naming rights, and its place in the game.
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="eyebrow">History</h3>
        {timeline.length > 0 ? (
          <ol className="mt-3 border-l border-border" data-testid="history-timeline">
            {timeline.map((event) => (
              <li key={event.key} className="relative pb-5 pl-5 last:pb-0">
                <span className="absolute -left-[3px] top-2 h-[5px] w-[5px] rounded-full bg-foreground" aria-hidden />
                <p className="text-sm text-foreground">
                  <span className="font-medium">{event.title}</span>{" "}
                  <span className="text-muted-foreground">{event.detail}</span>
                </p>
                <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {event.when}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {nft.isPendingMetadata ? "History is still syncing from the chain." : "No history recorded yet."}
          </p>
        )}
      </div>
    </section>
  );
}

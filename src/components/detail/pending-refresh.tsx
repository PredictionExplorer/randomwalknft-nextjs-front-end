"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PendingRefreshProps = {
  pending: boolean;
  /** True when the visitor arrived straight from minting (`?message=success`). */
  justMinted: boolean;
  /** The plaque line to show once the fresh-mint moment has passed. */
  plaque: string;
};

/**
 * The plaque under the title, plus the housekeeping a just-minted token needs:
 * the one-shot `?message=success` is removed from the address bar (the notice
 * survives because it lives in client state), and the server data refreshes
 * periodically until the indexer has caught up.
 */
export function PendingRefresh({ pending, justMinted, plaque }: PendingRefreshProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Captured once so the notice outlives the URL cleanup below.
  const [freshlyMinted] = useState(justMinted);

  useEffect(() => {
    if (justMinted) {
      router.replace(pathname as Route, { scroll: false });
    }
  }, [justMinted, pathname, router]);

  useEffect(() => {
    if (!pending) return;
    const interval = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(interval);
  }, [pending, router]);

  return (
    <p className="eyebrow" data-testid="token-plaque">
      {freshlyMinted ? "Freshly minted · the museum is rendering your six works" : plaque}
    </p>
  );
}

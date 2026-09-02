"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A just-minted token's page keeps itself current: the indexer usually catches up
 * within a minute, so refresh the server data periodically until it does. Also
 * drops the one-shot `?message=success` from the address bar.
 */
export function PendingRefresh({ pending, stripMessage }: { pending: boolean; stripMessage: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (stripMessage) {
      router.replace(pathname as Route, { scroll: false });
    }
  }, [stripMessage, pathname, router]);

  useEffect(() => {
    if (!pending) return;
    const interval = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(interval);
  }, [pending, router]);

  return null;
}

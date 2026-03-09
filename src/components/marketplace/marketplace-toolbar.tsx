"use client";

import { ArrowDownUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MarketplaceQueryState } from "@/lib/types";

export function MarketplaceToolbar({
  state,
  totalOffers
}: {
  state: MarketplaceQueryState;
  totalOffers: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearHref = "/marketplace";
  const currentFilter = state.filter;

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "price-asc") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/marketplace?${params.toString()}`);
  }

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-border/70 bg-card/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">Marketplace controls</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter by type, token, and price. Sorting updates instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {totalOffers} entries
          </span>
          <Button asChild variant="ghost" size="sm">
            <a href={clearHref}>Reset</a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3">
        <ArrowDownUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sort by</span>
        <select
          id="marketplace-sort"
          value={state.sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="h-9 appearance-none rounded-xl border border-input bg-card/80 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="recent">Most recent</option>
        </select>
      </div>

      <form action="/marketplace" className="space-y-4">
        <input type="hidden" name="sort" value={state.sort} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="filter"
            value="sell"
            variant={state.filter === "sell" ? "default" : "outline"}
            size="sm"
          >
            Sell listings
          </Button>
          <Button
            type="submit"
            name="filter"
            value="buy"
            variant={state.filter === "buy" ? "default" : "outline"}
            size="sm"
          >
            Buy offers
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="marketplace-query" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Token ID
            </label>
            <Input
              id="marketplace-query"
              name="query"
              type="number"
              min={0}
              placeholder="Search token"
              defaultValue={state.query}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="marketplace-min" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Min ETH
            </label>
            <Input id="marketplace-min" name="min" type="number" min={0} step="0.001" defaultValue={state.min} />
          </div>
          <div className="space-y-2">
            <label htmlFor="marketplace-max" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Max ETH
            </label>
            <Input id="marketplace-max" name="max" type="number" min={0} step="0.001" defaultValue={state.max} />
          </div>
        </div>
        <Button type="submit" name="filter" value={currentFilter}>
          Apply filters
        </Button>
      </form>

      {(state.query !== undefined || state.min !== undefined || state.max !== undefined) ? (
        <div className="flex flex-wrap gap-2 border-t border-border/30 pt-4">
          {state.query !== undefined ? (
            <span className="rounded-full border border-border/80 bg-accent/30 px-3 py-1 text-xs text-muted-foreground">
              Token #{state.query.toString().padStart(6, "0")}
            </span>
          ) : null}
          {state.min !== undefined ? (
            <span className="rounded-full border border-border/80 bg-accent/30 px-3 py-1 text-xs text-muted-foreground">
              Min {state.min} ETH
            </span>
          ) : null}
          {state.max !== undefined ? (
            <span className="rounded-full border border-border/80 bg-accent/30 px-3 py-1 text-xs text-muted-foreground">
              Max {state.max} ETH
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

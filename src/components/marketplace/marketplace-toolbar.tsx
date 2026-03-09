"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MarketplaceQueryState, MarketplaceSort } from "@/lib/types";

export function MarketplaceToolbar({
  state,
  totalOffers
}: {
  state: MarketplaceQueryState;
  totalOffers: number;
}) {
  const clearHref = "/marketplace";
  const currentFilter = state.filter;
  const [sort, setSort] = useState<MarketplaceSort>(state.sort);

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Marketplace controls</p>
          <p className="text-sm text-muted-foreground">
            Filter by offer type, token ID, price range, or sort the book by price and recency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {totalOffers} entries
          </span>
          <Button asChild variant="ghost" size="sm">
            <a href={clearHref}>Reset</a>
          </Button>
        </div>
      </div>

      <form action="/marketplace" className="grid gap-4 lg:grid-cols-4">
        <input type="hidden" name="sort" value={sort} />
        <div className="flex flex-wrap gap-2 lg:col-span-4">
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
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sort</span>
          <Select value={sort} onValueChange={(value: MarketplaceSort) => setSort(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-4">
          <Button type="submit" name="filter" value={currentFilter}>
            Apply marketplace filters
          </Button>
        </div>
      </form>

      {(state.query !== undefined || state.min !== undefined || state.max !== undefined || state.sort !== "price-asc") ? (
        <div className="flex flex-wrap gap-2">
          {state.query !== undefined ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Token #{state.query.toString().padStart(6, "0")}
            </span>
          ) : null}
          {state.min !== undefined ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Min {state.min} ETH
            </span>
          ) : null}
          {state.max !== undefined ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Max {state.max} ETH
            </span>
          ) : null}
          {state.sort !== "price-asc" ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              {state.sort === "price-desc" ? "Highest price first" : "Most recent first"}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

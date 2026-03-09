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
  const clearHref = "/marketplace";

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

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={state.filter === "sell" ? "default" : "outline"} size="sm">
          <a href="/marketplace" style={state.filter === "sell" ? { color: "#140a1f" } : undefined}>
            Sell listings
          </a>
        </Button>
        <Button asChild variant={state.filter === "buy" ? "default" : "outline"} size="sm">
          <a href="/marketplace?filter=buy" style={state.filter === "buy" ? { color: "#140a1f" } : undefined}>
            Buy offers
          </a>
        </Button>
      </div>

      <form action="/marketplace" className="grid gap-4 lg:grid-cols-4">
        {state.filter !== "sell" ? <input type="hidden" name="filter" value={state.filter} /> : null}
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
          <label htmlFor="marketplace-sort" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Sort
          </label>
          <select
            id="marketplace-sort"
            name="sort"
            defaultValue={state.sort}
            className="flex h-11 w-full rounded-2xl border border-input bg-card/70 px-4 py-2 text-sm text-foreground"
          >
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="recent">Most recent</option>
          </select>
        </div>
        <div className="lg:col-span-4">
          <Button type="submit">Apply marketplace filters</Button>
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

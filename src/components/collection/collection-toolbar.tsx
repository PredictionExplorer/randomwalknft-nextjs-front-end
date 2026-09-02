import type { Route } from "next";
import Link from "next/link";
import { Grid2x2, LayoutGrid, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildCollectionSearchParams } from "@/lib/query-state";
import type { CollectionQueryState } from "@/lib/types";
import { cn, shortenAddress } from "@/lib/utils";

function hrefFor(state: CollectionQueryState, changes: Partial<CollectionQueryState>): Route {
  const params = buildCollectionSearchParams({ ...state, page: 1, ...changes });
  const suffix = params.toString();
  return suffix ? `/gallery?${suffix}` : "/gallery";
}

/**
 * One hairline row of controls, all expressed as URLs so the gallery stays a
 * server-rendered, shareable, crawlable page: rooms (sort), hanging (density),
 * a jump-to-token field, and the active wallet filter.
 */
export function CollectionToolbar({ state }: { state: CollectionQueryState }) {
  const rooms = [
    { key: "tokenId", label: "Newest", href: hrefFor(state, { sortBy: "tokenId", query: undefined }) },
    { key: "beauty", label: "Most beautiful", href: hrefFor(state, { sortBy: "beauty", query: undefined }) }
  ] as const;

  return (
    <div className="space-y-3 border-y border-border py-3" data-testid="collection-toolbar">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Rooms" className="flex gap-1">
          {rooms.map((room) => {
            const active = state.sortBy === room.key && state.query === undefined;
            return (
              <Link
                key={room.key}
                href={room.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-sm px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {room.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <form action="/gallery" className="flex items-center gap-2" role="search">
            {state.address ? <input type="hidden" name="address" value={state.address} /> : null}
            {state.sortBy !== "tokenId" ? <input type="hidden" name="sortBy" value={state.sortBy} /> : null}
            {state.view !== "gallery" ? <input type="hidden" name="view" value={state.view} /> : null}
            <label htmlFor="gallery-query" className="sr-only">
              Jump to token number
            </label>
            <Input
              id="gallery-query"
              name="query"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Go to #"
              defaultValue={state.query}
              className="h-9 w-28 font-mono text-xs"
            />
            <Button type="submit" size="sm" variant="outline" aria-label="Jump to token">
              <Search className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </form>

          <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Hanging">
            {(
              [
                ["gallery", "Wall", LayoutGrid],
                ["compact", "Study", Grid2x2]
              ] as const
            ).map(([value, label, Icon]) => (
              <Link
                key={value}
                href={hrefFor(state, { view: value, page: state.page })}
                aria-pressed={state.view === value}
                aria-label={`${label} hanging`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-colors",
                  state.view === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {state.address || state.query !== undefined ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {state.address ? (
            <span className="inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              Collector {shortenAddress(state.address)}
              <Link
                href={hrefFor(state, { address: undefined })}
                aria-label="Clear collector filter"
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden />
              </Link>
            </span>
          ) : null}
          {state.query !== undefined ? (
            <span className="inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              Token #{String(state.query).padStart(6, "0")}
              <Link
                href={hrefFor(state, { query: undefined })}
                aria-label="Clear token filter"
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden />
              </Link>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

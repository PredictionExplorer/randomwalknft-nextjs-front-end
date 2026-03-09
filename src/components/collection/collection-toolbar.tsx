import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CollectionQueryState } from "@/lib/types";
import { buildCollectionSearchParams, getCollectionViewLabel } from "@/lib/query-state";

export function CollectionToolbar({ state }: { state: CollectionQueryState }) {
  const clearHref = state.address ? `/gallery?address=${state.address}` : "/gallery";

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Collection controls</p>
          <p className="text-sm text-muted-foreground">
            Search by token ID, change ranking mode, or switch between gallery and compact layouts.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={clearHref}>Clear filters</a>
        </Button>
      </div>

      <form action="/gallery" className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
        {state.address ? <input type="hidden" name="address" value={state.address} /> : null}
        <div className="space-y-2">
          <label htmlFor="gallery-query" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Search token ID
          </label>
          <Input
            id="gallery-query"
            name="query"
            type="number"
            min={0}
            placeholder="e.g. 124"
            defaultValue={state.query}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sort</span>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant={state.sortBy === "tokenId" ? "default" : "outline"} size="sm">
                <a href={state.address ? `/gallery?address=${state.address}` : "/gallery"}>Newest first</a>
              </Button>
              <Button asChild variant={state.sortBy === "beauty" ? "default" : "outline"} size="sm">
                <a href={state.address ? `/gallery?address=${state.address}&sortBy=beauty` : "/gallery?sortBy=beauty"}>
                  Beauty score
                </a>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">View</span>
            <div className="flex flex-wrap gap-2">
              {(["gallery", "compact"] as const).map((view) => {
                const params = buildCollectionSearchParams({
                  ...state,
                  page: 1,
                  view
                });

                return (
                  <Button key={view} asChild variant={state.view === view ? "default" : "outline"} size="sm">
                    <a href={`/gallery${params.toString() ? `?${params.toString()}` : ""}`}>
                      {getCollectionViewLabel(view)}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full lg:w-auto">
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}

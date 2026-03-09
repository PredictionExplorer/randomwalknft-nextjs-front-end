import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CollectionQueryState } from "@/lib/types";

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
        <input type="hidden" name="page" value="1" />
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
            <label htmlFor="gallery-sort" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Sort
            </label>
            <select
              id="gallery-sort"
              name="sortBy"
              defaultValue={state.sortBy}
              className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-card/70 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="tokenId">Newest first</option>
              <option value="beauty">Beauty score</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="gallery-view" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              View
            </label>
            <select
              id="gallery-view"
              name="view"
              defaultValue={state.view}
              className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-card/70 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="gallery">Gallery</option>
              <option value="compact">Compact</option>
            </select>
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

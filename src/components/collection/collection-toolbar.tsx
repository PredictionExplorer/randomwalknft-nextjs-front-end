"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CollectionQueryState } from "@/lib/types";

export function CollectionToolbar({ state }: { state: CollectionQueryState }) {
  const clearHref = state.address ? `/gallery?address=${state.address}` : "/gallery";
  const [sortBy, setSortBy] = useState(state.sortBy);
  const [view, setView] = useState(state.view);

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
        <input type="hidden" name="sortBy" value={sortBy} />
        <input type="hidden" name="view" value={view} />
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
            <Select value={sortBy} onValueChange={(value: "tokenId" | "beauty") => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tokenId">Newest first</SelectItem>
                <SelectItem value="beauty">Beauty score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">View</span>
            <Select value={view} onValueChange={(value: "gallery" | "compact") => setView(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gallery">Gallery</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
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

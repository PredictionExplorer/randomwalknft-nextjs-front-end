import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getPaginationWindow } from "@/lib/pagination";
import { cn } from "@/lib/utils";

function buildHref(pathname: string, page: number, currentSearchParams?: URLSearchParams) {
  const params = new URLSearchParams(currentSearchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pager({
  pathname,
  page,
  totalPages,
  searchParams
}: {
  pathname: string;
  page: number;
  totalPages: number;
  searchParams?: URLSearchParams;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {pages.map((value, index) =>
        value === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 font-mono text-sm text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Button key={value} variant={value === page ? "default" : "outline"} asChild size="sm">
            <Link
              href={buildHref(pathname, value, searchParams) as Route}
              className={cn("font-mono tabular-nums", value === page && "pointer-events-none")}
              aria-label={value === page ? `Current page, page ${value}` : `Go to page ${value}`}
              aria-current={value === page ? "page" : undefined}
            >
              {value}
            </Link>
          </Button>
        )
      )}
    </nav>
  );
}

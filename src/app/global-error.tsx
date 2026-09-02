"use client";

import { isRandomWalkBackendUnavailableMessage } from "@/lib/api/backend-errors";

import "@/app/globals.css";

/**
 * Renders its own <html> because the root layout has failed. Design tokens still apply
 * through the imported stylesheet, so the page matches the site even in this state.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const backendDown = isRandomWalkBackendUnavailableMessage(error.message);

  return (
    <html lang="en" data-wing="dark">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md space-y-6 text-center">
          <p className="eyebrow">Gallery closed for a moment</p>
          <h1 className="font-display text-4xl leading-tight">
            {backendDown ? "The backend is unreachable" : "Something went wrong"}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">
            {backendDown ? error.message : "A critical error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md border border-primary bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

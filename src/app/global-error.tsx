"use client";

import { isRandomWalkBackendUnavailableMessage } from "@/lib/api/backend-errors";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const backendDown = isRandomWalkBackendUnavailableMessage(error.message);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#050505] text-[#f8f4fb]">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold">
            {backendDown ? "RandomWalk backend API is down" : "Something went wrong"}
          </h1>
          <p className="text-sm text-[#c4c2ca]">
            {backendDown
              ? error.message
              : "A critical error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[rgba(244,191,255,0.24)] bg-[#c676d7] px-6 py-2.5 text-sm font-medium text-[#08030d] transition hover:bg-[#c676d7]/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

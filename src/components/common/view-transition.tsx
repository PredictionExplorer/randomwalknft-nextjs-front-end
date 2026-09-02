"use client";

import * as React from "react";

type ViewTransitionImpl = React.ExoticComponent<React.ViewTransitionProps> | undefined;

// The App Router ships React canary, which exports <ViewTransition>. Plain React
// (used by unit tests) does not, so degrade to a fragment there.
const Impl = (React as unknown as { ViewTransition?: ViewTransitionImpl }).ViewTransition;

/** Names an artwork so it morphs between the wall and the detail stage on navigation. */
export function ArtworkTransition({ tokenId, children }: { tokenId: number; children: React.ReactNode }) {
  if (!Impl) {
    return <>{children}</>;
  }
  return (
    <Impl name={`artwork-${tokenId}`} share="morph" default="none">
      {children}
    </Impl>
  );
}

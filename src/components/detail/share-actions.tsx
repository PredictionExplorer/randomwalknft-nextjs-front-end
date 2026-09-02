"use client";

import { Download, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/common/copy-button";
import { Button } from "@/components/ui/button";
import { useWingEdition } from "@/components/providers/wing-provider";
import type { NftAssetUrls } from "@/lib/types";
import { assetFileName, formatId, getAssetBySelection } from "@/lib/utils";

type ShareActionsProps = {
  tokenId: number;
  name: string;
  assets: NftAssetUrls;
  pageUrl: string;
};

/** Share the page, or take the CC0 files home. Downloads go through the same-origin proxy so the browser saves them. */
export function ShareActions({ tokenId, name, assets, pageUrl }: ShareActionsProps) {
  const edition = useWingEdition();
  const title = name ? `${formatId(tokenId)} “${name}” — Random Walk NFT` : `Random Walk NFT ${formatId(tokenId)}`;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="flex flex-wrap gap-2" data-testid="share-actions">
      {canShare ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.share({ title, url: pageUrl }).catch(() => undefined);
          }}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          Share
        </Button>
      ) : null}
      <CopyButton value={pageUrl} label="Copy link" toastMessage="Link copied." />
      <Button asChild variant="outline" size="sm">
        <a href={`/api/assets/${assetFileName(getAssetBySelection(assets, edition, "image"))}`} download>
          <Download className="h-3.5 w-3.5" aria-hidden />
          PNG · {edition}
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`/api/assets/${assetFileName(getAssetBySelection(assets, edition, "tripleVideo"))}`} download>
          <Download className="h-3.5 w-3.5" aria-hidden />
          Film · {edition}
        </a>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          void navigator.clipboard
            .writeText(getAssetBySelection(assets, edition, "image"))
            .then(() => toast.success("Image address copied."));
        }}
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden />
        Copy image address
      </Button>
    </div>
  );
}

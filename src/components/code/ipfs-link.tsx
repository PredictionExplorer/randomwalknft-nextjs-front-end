"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";

function truncateCid(cid: string, head = 6, tail = 4) {
  if (cid.length <= head + tail + 3) return cid;
  return `${cid.slice(0, head)}…${cid.slice(-tail)}`;
}

export function IpfsLink({
  uri,
  gatewayUrl
}: {
  uri: string;
  gatewayUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyUri() {
    await navigator.clipboard.writeText(uri);
    setCopied(true);
    toast.success("IPFS URI copied");
    window.setTimeout(() => setCopied(false), 1500);
  }

  const cid = uri.replace(/^ipfs:\/\//, "");
  const display = `ipfs://${truncateCid(cid)}`;

  return (
    <span className="inline-flex items-center gap-2">
      <ExternalLink
        href={gatewayUrl}
        className="font-mono text-sm text-secondary underline underline-offset-4 hover:text-secondary/80"
      >
        {display}
      </ExternalLink>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => void copyUri()}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="sr-only">Copy IPFS URI</span>
      </Button>
    </span>
  );
}

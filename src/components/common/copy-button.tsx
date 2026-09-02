"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

type CopyButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  value: string;
  /** Visible label; the copied state swaps the icon, not the text. */
  label: string;
  toastMessage?: string;
};

export function CopyButton({
  value,
  label,
  toastMessage,
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1_800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      variant={variant}
      size={size}
      {...props}
      onClick={() => {
        void navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            if (toastMessage) toast.success(toastMessage);
          })
          .catch(() => toast.error("Copy failed. Select the text and copy it manually."));
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
      <span className="sr-only" aria-live="polite">
        {copied ? " Copied" : ""}
      </span>
    </Button>
  );
}

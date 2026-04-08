"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatId } from "@/lib/utils";

export function NftCard({
  id,
  image,
  href,
  label,
  compact = false
}: {
  id: number;
  image: string;
  href?: string;
  label?: string;
  compact?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image, id]);

  const content = (
    <Card className="group overflow-hidden">
      <CardContent className="relative p-0">
        <div className={`relative overflow-hidden ${compact ? "aspect-square" : "aspect-[1.6/1]"}`}>
          {imageFailed ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted px-4 text-center"
              aria-hidden
            >
              <span className="font-mono text-lg text-muted-foreground">{formatId(id)}</span>
              <span className="text-xs text-muted-foreground/80">Preview not available yet</span>
            </div>
          ) : (
            <Image
              src={image}
              alt={`Preview image for NFT ${formatId(id)}`}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes={
                compact
                  ? "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              unoptimized
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
          <div
            className={`pointer-events-none absolute flex items-center gap-2 ${compact ? "bottom-3 left-3" : "bottom-4 left-4"}`}
          >
            <Badge variant="secondary">{label ?? formatId(id)}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href as Route}>{content}</Link> : content;
}

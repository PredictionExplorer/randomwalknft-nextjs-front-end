"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CodeArtifactCard({
  title,
  content,
  description,
  fileName
}: {
  title: string;
  content: string;
  description: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`${fileName} copied`);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  return (
    <Card className="bg-card/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void copyContent()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={downloadHref} download={fileName}>
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-[1.25rem] border border-border/60 bg-[#09090c] p-5 text-sm leading-6 text-slate-200">
          <code>{content}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

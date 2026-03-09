"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/lib/types";

type BlogFormProps = {
  title: string;
  submitLabel: string;
  action: (
    state: { error?: string; success?: string } | null,
    formData: FormData
  ) => Promise<{ error?: string; success?: string }>;
  initialBlog?: BlogPost;
};

export function BlogForm({ title, submitLabel, action, initialBlog }: BlogFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const thumbnailPreview = useMemo(() => {
    return thumbnailFile ? URL.createObjectURL(thumbnailFile) : initialBlog?.thumbImage;
  }, [initialBlog?.thumbImage, thumbnailFile]);

  const bannerPreview = useMemo(() => {
    return bannerFile ? URL.createObjectURL(bannerFile) : initialBlog?.bannerImage;
  }, [bannerFile, initialBlog?.bannerImage]);

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-[0.12em]">{title}</h1>
          <Button asChild variant="outline">
            <Link href="/admin">Back to list</Link>
          </Button>
        </div>

        <form action={formAction} className="space-y-6">
          {initialBlog ? <input type="hidden" name="blogId" value={initialBlog.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={initialBlog?.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epic">Epic</Label>
            <Input id="epic" name="epic" required defaultValue={initialBlog?.epic} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (HTML)</Label>
            <Textarea id="content" name="content" required defaultValue={initialBlog?.content} className="min-h-[18rem] font-mono text-xs leading-6" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="thumbnailImage">Thumbnail image</Label>
              <Input id="thumbnailImage" name="thumbnailImage" type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} />
              {thumbnailPreview ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" sizes="50vw" />
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              <Label htmlFor="bannerImage">Banner image</Label>
              <Input id="bannerImage" name="bannerImage" type="file" accept="image/*" onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)} />
              {bannerPreview ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
                  <Image src={bannerPreview} alt="Banner preview" fill className="object-cover" sizes="50vw" />
                </div>
              ) : null}
            </div>
          </div>

          {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

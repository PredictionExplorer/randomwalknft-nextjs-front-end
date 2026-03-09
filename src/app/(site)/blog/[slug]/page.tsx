import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getBlogBySlug } from "@/lib/api/public";
import { formatDateFromUnix } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    return {
      title: blog.title,
      description: blog.epic
    };
  } catch {
    return {
      title: "Blog"
    };
  }
}

export default async function BlogDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug).catch(() => null);
  if (!blog) {
    notFound();
  }

  return (
    <PageShell className="space-y-8 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Blog" },
          { label: blog.title }
        ]}
      />
      <div className="space-y-4">
        <Badge variant="secondary">{formatDateFromUnix(blog.createdAt)}</Badge>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[0.08em] text-foreground">{blog.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{blog.epic}</p>
      </div>

      <div className="relative aspect-[2/1] overflow-hidden rounded-[1.75rem] border border-border">
        <Image src={blog.bannerImage} alt={blog.title} fill className="object-cover" sizes="100vw" priority />
      </div>

      <Card className="p-8">
        <article
          className="prose prose-invert max-w-none text-sm leading-7 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </Card>
    </PageShell>
  );
}

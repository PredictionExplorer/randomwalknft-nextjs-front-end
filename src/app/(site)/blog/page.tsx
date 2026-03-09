import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Pager } from "@/components/common/pager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogs } from "@/lib/api/public";
import { BLOG_PAGE_SIZE } from "@/lib/config";
import { formatDateFromUnix } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const blogs = await getBlogs();

  const totalPages = Math.max(1, Math.ceil(blogs.length / BLOG_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const items = blogs.slice((safePage - 1) * BLOG_PAGE_SIZE, safePage * BLOG_PAGE_SIZE);
  const params = new URLSearchParams();
  if (resolvedSearchParams.page) {
    params.set("page", String(safePage));
  }

  return (
    <PageShell className="space-y-10 py-16">
      <PageHeading
        title={[
          { text: "OUR" },
          { text: "BLOG", tone: "primary" }
        ]}
        description="Updates, writing, and project notes from Random Walk NFT."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((blog) => (
          <Link key={blog.id} href={`/blog/${blog.slug}` as Route}>
            <Card className="h-full overflow-hidden transition hover:border-primary/60">
              <CardContent className="space-y-5 p-0">
                <div className="relative aspect-[1.8/1]">
                  <Image src={blog.bannerImage} alt={blog.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="space-y-4 p-6 pt-0">
                  <Badge variant="secondary">{formatDateFromUnix(blog.createdAt)}</Badge>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{blog.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{blog.epic}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Pager pathname="/blog" page={safePage} totalPages={totalPages} searchParams={params} />
    </PageShell>
  );
}

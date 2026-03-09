import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogForm } from "@/components/blog/blog-form";
import { PageShell } from "@/components/common/page-shell";
import { updateBlogAction } from "@/lib/actions/blog";
import { getBlogById } from "@/lib/api/public";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Edit Blog"
};

export default async function EditBlogPage({ params }: { params: Params }) {
  const { id } = await params;
  const blog = await getBlogById(Number(id)).catch(() => null);
  if (!blog) {
    notFound();
  }

  return (
    <PageShell className="py-16">
      <BlogForm title="Edit blog" submitLabel="Update" action={updateBlogAction} initialBlog={blog} />
    </PageShell>
  );
}

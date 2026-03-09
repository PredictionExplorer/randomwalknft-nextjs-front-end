import type { Metadata } from "next";

import { BlogForm } from "@/components/blog/blog-form";
import { PageShell } from "@/components/common/page-shell";
import { createBlogAction } from "@/lib/actions/blog";

export const metadata: Metadata = {
  title: "Create Blog"
};

export default function CreateBlogPage() {
  return (
    <PageShell className="py-16">
      <BlogForm title="Add blog" submitLabel="Create" action={createBlogAction} />
    </PageShell>
  );
}

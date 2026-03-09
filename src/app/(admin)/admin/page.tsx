import Link from "next/link";
import type { Metadata } from "next";

import { AdminBlogTable } from "@/components/blog/admin-blog-table";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { getBlogs } from "@/lib/api/public";
import { logoutAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Admin"
};

export default async function AdminPage() {
  const blogs = await getBlogs();

  return (
    <PageShell className="space-y-8 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-[0.12em]">BLOGS</h1>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/create">Create</Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </div>
      <AdminBlogTable blogs={blogs} />
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteBlogAction, toggleBlogAction } from "@/lib/actions/blog";
import type { BlogPost } from "@/lib/types";
import { formatDateFromUnix } from "@/lib/utils";

export function AdminBlogTable({ blogs }: { blogs: BlogPost[] }) {
  const [items, setItems] = useState(blogs);

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>{blog.status ? "Visible" : "Hidden"}</TableCell>
                <TableCell>{formatDateFromUnix(blog.createdAt)}</TableCell>
                <TableCell className="flex flex-wrap justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blogedit/${blog.id}` as Route}>Edit</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      startTransition(async () => {
                        await toggleBlogAction(blog.id, !blog.status);
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === blog.id ? { ...entry, status: !entry.status } : entry
                          )
                        );
                      })
                    }
                  >
                    {blog.status ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteBlogAction(blog.id);
                        setItems((current) => current.filter((entry) => entry.id !== blog.id));
                      })
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBlog,
  deleteBlog,
  ensureUniqueBlogSlug,
  toggleBlog,
  updateBlog
} from "@/lib/api/public";
import { requireSession } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

type ActionState = {
  error?: string;
  success?: string;
};

function appendFileIfPresent(formData: FormData, key: string, value: FormDataEntryValue | null) {
  if (value instanceof File && value.size > 0) {
    formData.append(key, value);
  }
}

export async function createBlogAction(_: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireSession();

  const title = formData.get("title");
  const epic = formData.get("epic");
  const content = formData.get("content");

  if (typeof title !== "string" || typeof epic !== "string" || typeof content !== "string") {
    return { error: "Please complete all blog fields." };
  }

  const unique = await ensureUniqueBlogSlug(title);
  if (!unique) {
    return { error: "A blog with that title already exists." };
  }

  const payload = new FormData();
  payload.append("title", title);
  payload.append("epic", epic);
  payload.append("content", content);
  appendFileIfPresent(payload, "thumbnailImage", formData.get("thumbnailImage"));
  appendFileIfPresent(payload, "bannerImage", formData.get("bannerImage"));

  const response = await createBlog(payload);
  if (response.result !== "success") {
    return { error: "Failed to create the blog post." };
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  return { success: "Blog created successfully." };
}

export async function updateBlogAction(_: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireSession();

  const blogId = formData.get("blogId");
  const title = formData.get("title");
  const epic = formData.get("epic");
  const content = formData.get("content");

  if (
    typeof blogId !== "string" ||
    typeof title !== "string" ||
    typeof epic !== "string" ||
    typeof content !== "string"
  ) {
    return { error: "Please complete all blog fields." };
  }

  const unique = await ensureUniqueBlogSlug(title, Number(blogId));
  if (!unique) {
    return { error: "A blog with that title already exists." };
  }

  const payload = new FormData();
  payload.append("blog_id", blogId);
  payload.append("title", title);
  payload.append("epic", epic);
  payload.append("content", content);
  appendFileIfPresent(payload, "thumbnailImage", formData.get("thumbnailImage"));
  appendFileIfPresent(payload, "bannerImage", formData.get("bannerImage"));

  const response = await updateBlog(payload);
  if (response.result !== "success") {
    return { error: "Failed to update the blog post." };
  }

  const slug = slugify(title);
  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { success: "Blog updated successfully." };
}

export async function deleteBlogAction(blogId: number) {
  await requireSession();
  await deleteBlog(blogId);
  revalidatePath("/admin");
  revalidatePath("/blog");
}

export async function toggleBlogAction(blogId: number, status: boolean) {
  await requireSession();
  await toggleBlog(blogId, status);
  revalidatePath("/admin");
  revalidatePath("/blog");
}

export async function goToAdminListAction() {
  await requireSession();
  redirect("/admin");
}

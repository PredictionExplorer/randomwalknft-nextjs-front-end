// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSession = vi.fn();
const ensureUniqueBlogSlug = vi.fn();
const createBlog = vi.fn();
const updateBlog = vi.fn();
const deleteBlog = vi.fn();
const toggleBlog = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/auth/session", () => ({
  requireSession
}));

vi.mock("@/lib/api/public", () => ({
  createBlog,
  deleteBlog,
  ensureUniqueBlogSlug,
  toggleBlog,
  updateBlog
}));

describe("blog actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue(undefined);
  });

  it("prevents duplicate blog creation", async () => {
    ensureUniqueBlogSlug.mockResolvedValue(false);
    const { createBlogAction } = await import("@/lib/actions/blog");
    const formData = new FormData();
    formData.set("title", "Hello");
    formData.set("epic", "World");
    formData.set("content", "<p>Test</p>");

    await expect(createBlogAction(null, formData)).resolves.toEqual({
      error: "A blog with that title already exists."
    });
  });

  it("creates a blog and revalidates admin and blog pages", async () => {
    ensureUniqueBlogSlug.mockResolvedValue(true);
    createBlog.mockResolvedValue({ result: "success" });
    const { createBlogAction } = await import("@/lib/actions/blog");
    const formData = new FormData();
    formData.set("title", "Hello");
    formData.set("epic", "World");
    formData.set("content", "<p>Test</p>");

    await expect(createBlogAction(null, formData)).resolves.toEqual({
      success: "Blog created successfully."
    });
    expect(createBlog).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
  });

  it("updates a blog and revalidates the edited slug route", async () => {
    ensureUniqueBlogSlug.mockResolvedValue(true);
    updateBlog.mockResolvedValue({ result: "success" });
    const { updateBlogAction } = await import("@/lib/actions/blog");
    const formData = new FormData();
    formData.set("blogId", "7");
    formData.set("title", "Hello Updated");
    formData.set("epic", "World");
    formData.set("content", "<p>Test</p>");

    await expect(updateBlogAction(null, formData)).resolves.toEqual({
      success: "Blog updated successfully."
    });
    expect(revalidatePath).toHaveBeenCalledWith("/blog/hello-updated");
  });

  it("revalidates after delete and toggle", async () => {
    deleteBlog.mockResolvedValue({ result: "success" });
    toggleBlog.mockResolvedValue({ result: "success" });
    const { deleteBlogAction, toggleBlogAction } = await import("@/lib/actions/blog");

    await deleteBlogAction(3);
    await toggleBlogAction(3, true);

    expect(deleteBlog).toHaveBeenCalledWith(3);
    expect(toggleBlog).toHaveBeenCalledWith(3, true);
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
  });
});

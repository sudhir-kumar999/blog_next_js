// app/admin/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadPostImage } from "@/lib/supabase/uploadImage";

export default function NewPostPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  const [uploadingContentImage, setUploadingContentImage] =
    useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] =
    useState(false);

  // 🔹 Create post
  async function createPost(formData: FormData) {
    formData.set("content", content);

    if (featuredImage) {
      formData.set("featured_image", featuredImage);
    }

    await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    router.push("/admin");
  }

  // 🔹 Content image upload (Markdown)
  async function handleContentImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingContentImage(true);
      const imageUrl = await uploadPostImage(file);

      // Auto insert Markdown image
      setContent(
        (prev) =>
          `${prev}\n\n![Post image](${imageUrl})\n`
      );
    } catch {
      alert("Content image upload failed");
    } finally {
      setUploadingContentImage(false);
    }
  }

  // 🔹 Featured image upload (Title ke niche)
  async function handleFeaturedImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFeaturedImage(true);
      const imageUrl = await uploadPostImage(file);
      setFeaturedImage(imageUrl);
    } catch {
      alert("Featured image upload failed");
    } finally {
      setUploadingFeaturedImage(false);
    }
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">New Post</h1>

      <form action={createPost} className="space-y-6">
        <input
          name="title"
          placeholder="Title"
          required
          className="w-full rounded border px-3 py-2"
        />

        <input
          name="slug"
          placeholder="Slug"
          required
          className="w-full rounded border px-3 py-2"
        />

        <textarea
          name="excerpt"
          placeholder="Excerpt"
          className="w-full rounded border px-3 py-2"
        />

        {/* 🔹 Featured Image */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Featured Image (Title ke niche)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageUpload}
          />

          {uploadingFeaturedImage && (
            <p className="mt-2 text-sm text-zinc-500">
              Uploading featured image...
            </p>
          )}

          {featuredImage && (
            <img
              src={featuredImage}
              alt="Featured preview"
              className="mt-4 h-40 w-full rounded object-cover"
            />
          )}
        </div>

        {/* 🔹 Content Image */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Insert Image into Content
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleContentImageUpload}
          />

          {uploadingContentImage && (
            <p className="mt-2 text-sm text-zinc-500">
              Uploading content image...
            </p>
          )}
        </div>

        {/* 🔹 Markdown content */}
        <textarea
          name="content"
          placeholder="Markdown content"
          rows={12}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded border px-3 py-2 font-mono"
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" />
          Publish
        </label>

        <button className="rounded bg-black px-4 py-2 text-white">
          Create
        </button>
      </form>
    </>
  );
}

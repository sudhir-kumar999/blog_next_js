// app/admin/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { uploadPostImage } from "@/lib/supabase/uploadImage";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

export default function NewPostPage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  const [uploadingContentImage, setUploadingContentImage] =
    useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] =
    useState(false);

  const wordCount = useMemo(() => countWords(content), [content]);
  const meetsMinWords = wordCount >= MIN_POST_WORDS;

  // 🔹 Create post
  async function createPost(formData: FormData) {
    if (!meetsMinWords) {
      alert(`Post must be at least ${MIN_POST_WORDS} words. Current: ${wordCount} words.`);
      return;
    }
    formData.set("content", content);

    if (featuredImage) {
      formData.set("featured_image", featuredImage);
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to create post. Try again.");
      return;
    }

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
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">Markdown content (min 1500 words)</label>
            <span className={`text-sm ${meetsMinWords ? "text-green-600" : "text-amber-600"}`}>
              {wordCount} / {MIN_POST_WORDS} words
            </span>
          </div>
          <textarea
            name="content"
            placeholder="Markdown content"
            rows={12}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border px-3 py-2 font-mono"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" />
          Publish
        </label>

        <button
          type="submit"
          disabled={!meetsMinWords}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </form>
    </>
  );
}

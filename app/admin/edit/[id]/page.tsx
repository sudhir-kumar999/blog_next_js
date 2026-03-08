// app/admin/edit/[id]/page.tsx
"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

interface Category {
  id: string;
  name: string;
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js latest params fix
  const { id } = use(params);

  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState("");

  // 🔹 Fetch post
  useEffect(() => {
    if (!id) return;

    supabaseBrowser
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setPost(data);
        if (data?.content) setContent(data.content);
      });
  }, [id]);

  // 🔹 Fetch categories
  useEffect(() => {
    supabaseBrowser
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const wordCount = useMemo(() => countWords(content), [content]);
  const meetsMinWords = wordCount >= MIN_POST_WORDS;

  async function updatePost(formData: FormData) {
    formData.set("content", content);
    if (!meetsMinWords) {
      alert(`Post must be at least ${MIN_POST_WORDS} words. Current: ${wordCount} words.`);
      return;
    }
    const res = await fetch("/api/posts", {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Update failed.");
      return;
    }
    router.push("/admin");
  }

  if (!post) return null;

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Edit Post</h1>

      <form action={updatePost} className="space-y-6">
        {/* Hidden ID */}
        <input name="id" defaultValue={post.id} hidden />

        {/* Title */}
        <input
          name="title"
          defaultValue={post.title}
          required
          className="w-full rounded border px-3 py-2"
        />

        {/* Slug */}
        <input
          name="slug"
          defaultValue={post.slug}
          required
          className="w-full rounded border px-3 py-2"
        />

        {/* Excerpt */}
        <textarea
          name="excerpt"
          defaultValue={post.excerpt || ""}
          className="w-full rounded border px-3 py-2"
        />

        {/* Content (min 1500 words) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">Content (min 1500 words)</label>
            <span className={`text-sm ${meetsMinWords ? "text-green-600" : "text-amber-600"}`}>
              {wordCount} / {MIN_POST_WORDS} words
            </span>
          </div>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        {/* 🔥 CATEGORY SELECT (NEW) */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Category
          </label>

          <select
            name="category_id"
            defaultValue={post.category_id || ""}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select category</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publish */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post.published}
          />
          Publish
        </label>

        <button
          type="submit"
          disabled={!meetsMinWords}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update
        </button>
      </form>
    </>
  );
}

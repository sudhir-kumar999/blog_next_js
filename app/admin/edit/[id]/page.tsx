// app/admin/edit/[id]/page.tsx
"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

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

  // 🔹 Fetch post
  useEffect(() => {
    if (!id) return;

    supabaseBrowser
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setPost(data));
  }, [id]);

  // 🔹 Fetch categories
  useEffect(() => {
    supabaseBrowser
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  async function updatePost(formData: FormData) {
    await fetch("/api/posts", {
      method: "PUT",
      body: formData,
    });

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

        {/* Content */}
        <textarea
          name="content"
          defaultValue={post.content}
          rows={10}
          className="w-full rounded border px-3 py-2"
        />

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

        <button className="rounded bg-black px-4 py-2 text-white">
          Update
        </button>
      </form>
    </>
  );
}

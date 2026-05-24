"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { requireSupabaseBrowser } from "@/lib/supabase/browser";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  categories?: { name: string }[];
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    requireSupabaseBrowser()
      .from("posts")
      .select(`
        id,
        title,
        slug,
        published,
        published_at,
        categories (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data as Post[]);
      });
  }, []);

  async function deletePost(id: string) {
    const ok = confirm("Delete this post permanently?");
    if (!ok) return;

    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      alert("Failed to delete post");
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
  <>
      <header className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/80 p-6">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Admin dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          Posts are written, SEO/AEO optimized, and published automatically by AI (Gemini cron).
          You do not need to edit posts manually.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Cron: 2 study posts per day · categories auto-assigned · min ~1500 words each
        </p>
      </header>

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900">{post.title}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {post.published ? "Published" : "Draft"}
                {post.categories?.[0]?.name && <> · {post.categories[0].name}</>}
                {post.published_at &&
                  ` · ${new Date(post.published_at).toLocaleDateString("en-IN")}`}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex min-h-[40px] items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => deletePost(post.id)}
                className="inline-flex min-h-[40px] items-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
            No posts yet. The next cron run will publish automatically when GEMINI_API_KEY is set.
          </p>
        )}
      </div>
    </>
  );
}

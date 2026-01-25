"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface Post {
  id: string;
  title: string;
  published: boolean;
  published_at: string | null;
  categories?: { name: string }[];
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabaseBrowser
      .from("posts")
      .select(`
        id,
        title,
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
    const ok = confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete post");
      return;
    }

    // ✅ Remove from UI without reload
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin – Posts</h1>

        <Link
          href="/admin/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          + New Post
        </Link>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded border p-4"
          >
            <div>
              <p className="font-medium">{post.title}</p>

              <p className="text-sm text-zinc-500">
                {post.published ? "Published" : "Draft"}
                {post.categories?.[0]?.name && (
                  <> • Category: {post.categories[0].name}</>
                )}
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/admin/edit/${post.id}`}
                className="text-blue-600"
              >
                Edit
              </Link>

              <button
                onClick={() => deletePost(post.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-zinc-500">No posts yet.</p>
        )}
      </div>
    </>
  );
}

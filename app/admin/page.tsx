import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0; // admin always fresh

export default async function AdminPage() {
  const { data: posts } = await supabaseServer
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
    .order("created_at", { ascending: false });

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
        {posts?.map((post) => (
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

              <form action={`/api/posts/${post.id}`} method="POST">
                <input type="hidden" name="_method" value="DELETE" />
                <button className="text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}

        {posts?.length === 0 && (
          <p className="text-zinc-500">No posts yet.</p>
        )}
      </div>
    </>
  );
}

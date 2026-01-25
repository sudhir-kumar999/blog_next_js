import Link from "next/link";

interface Category {
  name: string;
  slug: string;
}

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    categories: Category[] | null; // ✅ ARRAY FIX
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const category = post.categories?.[0]; // ✅ SAFE ACCESS

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:shadow-md">
      {/* Category */}
      {category && (
        <Link
          href={`/category/${category.slug}`}
          className="mb-2 inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          {category.name}
        </Link>
      )}

      {/* Title */}
      <h2 className="text-2xl font-semibold text-black">
        <Link href={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mt-3 text-zinc-600">
          {post.excerpt}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 text-sm text-zinc-500">
        {new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </article>
  );
}

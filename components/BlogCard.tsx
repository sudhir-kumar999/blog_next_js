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
    categories: Category[] | Category | null;
  };
}

function getFirstCategory(categories: Category[] | Category | null | undefined): Category | null {
  if (!categories) return null;
  return Array.isArray(categories) ? categories[0] ?? null : categories;
}

export default function BlogCard({ post }: BlogCardProps) {
  const category = getFirstCategory(post.categories);

  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      {/* Category */}
      {category && (
        <Link
          href={`/category/${category.slug}`}
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
        >
          {category.name}
        </Link>
      )}

      {/* Title */}
      <h2 className="text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-600 sm:text-xl">
        <Link href={`/blog/${post.slug}`} className="focus:outline-none">
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
          {post.excerpt}
        </p>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
        <time dateTime={post.published_at}>
          {new Date(post.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        <span className="inline-flex items-center gap-1 font-medium text-blue-600 transition-all group-hover:gap-2">
          Read
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
}

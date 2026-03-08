"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

interface ScheduledPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    seo_title: "",
    seo_description: "",
    content: "",
    sort_order: 0,
  });

  useEffect(() => {
    fetch("/api/scheduled-posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      alert("Title, slug and content are required.");
      return;
    }
    if (!meetsMinWords) {
      alert(`Post must be at least ${MIN_POST_WORDS} words. Current: ${wordCount} words.`);
      return;
    }
    setAdding(true);
    fetch("/api/scheduled-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        content: form.content.trim(),
        sort_order: form.sort_order,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setPosts((prev) => [data, ...prev]);
        setForm({ title: "", slug: "", excerpt: "", seo_title: "", seo_description: "", content: "", sort_order: posts.length });
      })
      .finally(() => setAdding(false));
  }

  const wordCount = useMemo(() => countWords(form.content), [form.content]);
  const meetsMinWords = wordCount >= MIN_POST_WORDS;

  const pending = posts.filter((p) => !p.is_published);
  const published = posts.filter((p) => p.is_published);

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold">Scheduled Posts (Daily Auto-Publish)</h1>
          <p className="text-zinc-500 text-sm mt-1">
            One post from the queue is published automatically every day at 6:00 AM (IST). SEO fields optional.
          </p>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Add to queue</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <input
            type="text"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Slug (e.g. my-post-title)"
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
          <textarea
            placeholder="Excerpt (optional)"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded border border-zinc-300 px-3 py-2"
            rows={2}
          />
          <input
            type="text"
            placeholder="SEO Title (optional – else post title used)"
            value={form.seo_title}
            onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
          <textarea
            placeholder="SEO Description (optional – else excerpt used)"
            value={form.seo_description}
            onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
            className="w-full rounded border border-zinc-300 px-3 py-2"
            rows={2}
          />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Content (Markdown, min 1500 words)</span>
              <span className={`text-sm ${meetsMinWords ? "text-green-600" : "text-amber-600"}`}>
                {wordCount} / {MIN_POST_WORDS} words
              </span>
            </div>
            <textarea
              placeholder="Content (Markdown)"
              required
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
              rows={8}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Order (lower = publish first)</label>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
              className="w-24 rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !meetsMinWords}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? "Adding…" : "Add to queue"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Queue ({pending.length} pending)</h2>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-zinc-500">No posts in queue. Add one above.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded border border-zinc-200 p-4"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-zinc-500">/{p.slug} · Order: {p.sort_order}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {published.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Already published ({published.length})</h2>
          <ul className="space-y-2">
            {published.map((p) => (
              <li key={p.id} className="text-sm text-zinc-500">
                {p.title} — published
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

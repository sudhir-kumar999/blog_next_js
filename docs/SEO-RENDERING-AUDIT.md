# SEO rendering audit – blog pages

## 1. Summary

**Result:** Blog list and blog post pages are **already server-rendered**. There is **no client-side fetching** (no `useEffect`, no client Supabase) that would give Google empty HTML.

| Page | Rendering | Data source | Initial HTML |
|------|-----------|-------------|--------------|
| `/blog` | Server (async) + ISR | `supabaseServer` in async component | Full list of posts |
| `/blog/[slug]` | Server + SSG/ISR | `generateStaticParams` + `supabaseServer` in async component | Full article + metadata |
| `/` (home) | Server + ISR | `supabaseServer` | Full post list |

**One fix applied:** Blog list had `opacity: 0` + CSS animation on post cards. That could make content invisible in the initial paint; removed so all content is visible in the first HTML (better for crawlers).

---

## 2. What was checked

### 2.1 Blog content in `useEffect` or client-side API

- **Finding:** None.
- **Evidence:** No `"use client"` in `app/blog/page.tsx` or `app/blog/[slug]/page.tsx`. No `useEffect`, no `supabaseBrowser`, no client fetch in any blog route.
- **Conclusion:** All blog data is fetched on the server; no “empty shell + JS loads content” pattern.

### 2.2 Empty HTML then JS-only content

- **Finding:** Not present.
- **Evidence:** Both blog list and blog post are **async Server Components**. They call `supabaseServer` during the server render; the response HTML already contains titles, excerpts, and full article body (via `BlogContent` with server-built `html`).
- **Conclusion:** First byte from the server includes the full blog content.

### 2.3 Dynamic routes not statically generated

- **Finding:** Blog post route is **statically generated with ISR**.
- **Evidence:**
  - `generateStaticParams()` returns all published slugs from Supabase (build time).
  - `revalidate = 60` → ISR (revalidate every 60s).
  - `dynamicParams = true` → unknown slugs still render on demand (e.g. new posts).
- **Conclusion:** Known slugs are pre-rendered; new posts are server-rendered on first request. No “dynamic only, never static” issue.

### 2.4 Missing SSR/SSG for blog posts

- **Finding:** Not missing.
- **Evidence:** Blog post page uses:
  - `generateStaticParams` (SSG)
  - `revalidate` (ISR)
  - Async default component that fetches post and renders full HTML (including `BlogContent` with `markdownToHtml(post.content)` on the server).
- **Conclusion:** Blog posts are SSG/ISR with full content in the initial response.

---

## 3. Why client-side fetch can cause “Crawled – currently not indexed”

If blog content were loaded only in the client:

1. **First response:** HTML would have an empty `<main>` or a loading state (e.g. “Loading…”).
2. **After JS runs:** `useEffect` → fetch from API → setState → React renders the real content.
3. **Crawlers:** Googlebot may run JS, but timing and budget vary. If the crawler doesn’t wait or execute JS fully, it only sees the empty/loading HTML.
4. **Result:** Page is “Crawled” but “currently not indexed” because the visible content in the initial response is not the actual article.

In this project, **none of that happens** – content is rendered on the server and sent in the first response.

---

## 4. Correct pattern used (no conversion needed)

### 4.1 Blog list (`app/blog/page.tsx`)

- **Pattern:** Async Server Component + ISR.
- **Data:** Fetched with `supabaseServer` inside the default export (server-only).
- **Output:** Full list of posts in the initial HTML; no client fetch.
- **Metadata:** Static `metadata` (title, description, canonical, OG, robots).
- **Change made:** Removed `opacity: 0` and animation from post cards so content is visible in initial paint; added `getFirstCategory()` for safe category display (array or object).

### 4.2 Blog post (`app/blog/[slug]/page.tsx`)

- **Pattern:** SSG/ISR + async Server Component.
- **Data:**
  - `generateStaticParams()` → list of slugs at build (optional; `dynamicParams = true` still allows new slugs).
  - Post and “other posts” fetched with `supabaseServer` in the default async component.
- **Content:** `markdownToHtml(post.content)` runs on the server; result passed to `BlogContent` (no `"use client"` in `BlogContent`), so article body is in the first HTML.
- **Metadata:** `generateMetadata()` with title, description, canonical, OG, Twitter, robots.
- **No change needed** for SSR/SSG; only comments added to document the strategy.

---

## 5. Metadata, canonical, sitemap

| Item | Status |
|------|--------|
| **Blog list** | `metadata`: title, description, `alternates.canonical`, openGraph, robots. |
| **Blog post** | `generateMetadata()`: title, description, canonical, OG (article), Twitter, robots, keywords. |
| **Canonical** | Blog list: `${SITE_BASE_URL}/blog`. Post: `${SITE_BASE_URL}/blog/${slug}`. |
| **Sitemap** | `app/sitemap.ts` builds URLs from Supabase (including all published posts); `dynamic` + `revalidate = 0` so new posts show up as soon as sitemap is requested. |

No changes required for indexing; only the blog list visibility fix (opacity) and category helper were applied.

---

## 6. Files touched

| File | Change |
|------|--------|
| `app/blog/page.tsx` | Removed `opacity: 0` and animation from post cards; added `getFirstCategory()`; added SEO comment. |
| `app/blog/[slug]/page.tsx` | Added short comment documenting SSG/ISR and that content is server-rendered. |
| `docs/SEO-RENDERING-AUDIT.md` | New: audit summary and explanation. |

---

## 7. Conclusion

- **No blog page uses client-side rendering for content** – no `useEffect` or client API for blog data.
- **Blog list and blog post** use **server-side data fetch** and send **full content in the initial HTML**.
- **Blog post** uses **SSG + ISR** (`generateStaticParams`, `revalidate`, `dynamicParams`).
- The only fix that could affect “Crawled – currently not indexed” was **removing initial `opacity: 0`** on the blog list so that all post content is visible in the first paint.
- Metadata, canonical, and sitemap are already in place and compatible with indexing.

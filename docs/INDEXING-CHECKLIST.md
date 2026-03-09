# Indexing Checklist – "Crawled - Currently Not Indexed" Fix

Google **crawls** your page but sometimes **does not index** it ("Crawled - Currently Not Indexed"). This is not a penalty. It usually means Google does not yet consider the page important or useful enough to show in search. Below is what is already in place and what you should do after publishing a post.

---

## What is already done (technical)

- **Static/SSG** – Blog post pages are pre-rendered so the full article is in the first HTML (good for indexing).
- **Sitemap** – `/sitemap.xml` is dynamic; new published posts appear there as soon as they are live.
- **Robots** – `robots.txt` allows crawling and points to the sitemap.
- **Canonical** – Each post has a canonical URL (`https://www.studymitra.in/blog/[slug]`).
- **Structured data** – Each post has BlogPosting JSON-LD (headline, dates, author, publisher, wordCount).
- **Internal links** – Each post is linked from:
  - Homepage (latest posts)
  - Blog list (`/blog`)
  - Category page (if you assign a category)
  - "More articles" section at the bottom of each post

So technically the site is ready for indexing. The rest depends on **content quality**, **time**, and **signals** you give to Google.

---

## What you should do after publishing a new post

### 1. Give the post internal links

- **Assign a category** to the post (Edit post → Category). Then the post appears on that category page and gets another strong internal link.
- The post will already appear on **Home** and **/blog** (they revalidate every 60 seconds), so no extra step there.

### 2. Submit the sitemap in Google Search Console (once per site)

- Open [Google Search Console](https://search.google.com/search-console) → your property.
- Go to **Sitemaps**.
- Add: `https://www.studymitra.in/sitemap.xml`
- Submit. You do not need to resubmit for every new post; Google will recrawl the sitemap.

### 3. Request indexing for the new URL

- In GSC, open **URL Inspection**.
- Paste the full post URL, e.g. `https://www.studymitra.in/blog/your-post-slug`.
- Click **Request indexing** (if the button is available).
- You can do this once per URL; doing it again after a few days is fine, but avoid spamming.

### 4. Wait and monitor

- Indexing can take **3–7 days** or more for new or low-authority sites.
- Check **Pages → Indexed** and **Pages → Excluded** in GSC to see if the URL moves from "Crawled - Currently not indexed" to "Indexed".
- If it stays "Crawled - Currently not indexed" for weeks, focus on:
  - **Content** – 1500+ words, unique, useful (you already enforce 1500+).
  - **Internal links** – Category + homepage + blog list + "More articles" (all in place).
  - **Backlinks** – Share the post (e.g. social, newsletter) so Google sees the URL elsewhere.

---

## Why "Crawled - Currently Not Indexed" happens

- **New or small site** – Google indexes only a part of the site at first.
- **Low perceived value** – Few internal links, no backlinks, or very new URL.
- **Quality filter** – Google prefers to show pages it thinks are useful; strong content and internal links help.

Improving **internal links** (category + home + blog + "More articles") and **content quality** (length, uniqueness) and then **requesting indexing** and waiting is the right approach. No code change can force Google to index a URL; the site is already set up correctly for indexing.

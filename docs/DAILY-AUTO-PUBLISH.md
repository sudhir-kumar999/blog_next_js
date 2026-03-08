# Daily auto-publish (rooz subah 6 baje 1 post automatic)

Har din **6 AM IST** ko queue se **ek post** automatically publish hoti hai. Har post **SEO optimized** (seo_title, seo_description) ke saath insert hoti hai. Blog pe koi negative effect nahi—sirf ek nayi post add hoti hai.

## 1. Supabase me table banao

Supabase Dashboard → **SQL Editor** → New query → ye SQL chalao (file: `supabase/scheduled_posts.sql`):

```sql
create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  seo_title text,
  seo_description text,
  featured_image text,
  category_id uuid references categories(id),
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_scheduled_posts_queue
  on scheduled_posts (is_published, sort_order)
  where is_published = false;

alter table scheduled_posts enable row level security;
```

**Agar table pehle se bana hai:** sirf SEO columns add karo:
```sql
alter table scheduled_posts add column if not exists seo_title text;
alter table scheduled_posts add column if not exists seo_description text;
```

**Important:** `posts` table me `seo_title` aur `seo_description` columns honi chahiye (tumhare schema me hain). Image column agar `cover_image` hai to app me bhi wahi use karo; cron ab `featured_image` use karta hai—agar tumhare posts table me sirf `cover_image` hai to Supabase me column name `featured_image` bana lo ya code me `cover_image` use karo.

## 2. Vercel pe CRON_SECRET set karo

1. Vercel → Project → **Settings** → **Environment Variables**
2. Add: **Name** `CRON_SECRET`, **Value** koi strong random string
3. Save karo.

## 3. Vercel Cron (already set)

- **Path:** `/api/cron/daily-publish`
- **Schedule:** `30 0 * * *` = har din **00:30 UTC** = **6:00 AM IST**

Time change: `vercel.json` me `schedule` edit karo ([crontab.guru](https://crontab.guru/)).

## 4. Admin se posts queue me daalo (SEO + no plagiarism / trending)

1. Login → **Admin** → **Daily queue** (ya `/admin/scheduled`)
2. **Title**, **Slug**, **Excerpt** daalo
3. **SEO Title** (optional—nahi diya to post title use hoga), **SEO Description** (optional—nahi diya to excerpt use hoga)
4. **Content (Markdown)** — **min 1500 words** (validation on), original, plagiarism-free, trending topic
5. **Order** = jis post ko pehle publish karna hai usko chota number do (0, 1, 2…)
6. **Add to queue** dabao

Har din **6 AM IST** ko queue me se **next post** (sabse chota sort_order) automatically **posts** table me publish hogi, **seo_title** aur **seo_description** ke saath (agar diye to woh, warna title/excerpt).

## 5. Manual test (optional)

Local ya production pe cron wait na kare to manually test karo:

```bash
curl -X GET "https://www.studymitra.in/api/cron/daily-publish" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Agar queue me post ho to response me `published: { title, slug }` aayega.

## Blog pe effect na pade

- Har run me **sirf 1 post** publish hoti hai (limit 1).
- Slug unique hota hai (scheduled_posts me unique), isliye duplicate post nahi banti.
- Insert fail hone par scheduled_posts me `is_published` update nahi hota, to next run me wahi post dubara try ho sakti hai.
- Normal blog pages, sitemap, indexing pe koi change nahi—sirf nayi post add hoti hai.

## Summary

| Step | Kya karna hai |
|------|----------------|
| 1 | Supabase me `scheduled_posts` table (+ SEO columns) SQL run karo |
| 2 | Vercel env me `CRON_SECRET` set karo |
| 3 | Deploy karo |
| 4 | Admin → Daily queue se SEO-optimized, original posts add karo |
| 5 | Har din **6 AM IST** ko 1 post auto publish hogi, blog pe koi side effect nahi |

-- Run in Supabase SQL Editor to harden database access.
-- Public site reads published posts only; writes go through service role (cron) or authenticated admin.

-- Profiles: users read own row only
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Posts: public read published only
alter table public.posts enable row level security;

drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_published"
  on public.posts for select
  using (published = true);

drop policy if exists "posts_select_admin" on public.posts;
create policy "posts_select_admin"
  on public.posts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Categories: public read
alter table public.categories enable row level security;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- Scheduled posts: no public access (admin API uses service role)
alter table public.scheduled_posts enable row level security;

-- No anon insert/update/delete policies on posts or scheduled_posts.
-- Service role bypasses RLS for cron; admin dashboard uses service role via API routes only after auth check.

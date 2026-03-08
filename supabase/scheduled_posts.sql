-- Run this in Supabase SQL Editor to create the queue table for daily auto-publish.
-- Table: scheduled_posts (queue of posts to publish one per day)

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

-- If table already exists, add SEO columns:
-- alter table scheduled_posts add column if not exists seo_title text;
-- alter table scheduled_posts add column if not exists seo_description text;

-- Optional: index for cron (pick next unpublished by order)
create index if not exists idx_scheduled_posts_queue
  on scheduled_posts (is_published, sort_order)
  where is_published = false;

-- RLS: only backend (service role) should access this table; anon has no policy so no access
alter table scheduled_posts enable row level security;

-- ===========================================================================
-- Midium — Supabase database schema
-- Run this in your Supabase Dashboard → SQL Editor → New query → Run.
-- It creates the tables + Row-Level-Security policies so the browser can read
-- and write data safely with just the anon key. After running it, I'll wire
-- the app's data layer (articles.js etc.) to use these tables.
-- ===========================================================================

-- ---- PROFILES : one row per user (display name + avatar) -------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  updated_at   timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable by everyone"
  on public.profiles for select using (true);
create policy "users manage their own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---- ARTICLES : everyone's published posts (shared across all users) --------
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references auth.users(id) on delete set null,
  author_name text,
  title       text not null,
  dek         text,
  tag         text,
  accent      text,
  emoji       text,
  cover       text,          -- uploaded photo (data URL) or image URL
  body        text,
  created_at  timestamptz default now()
);
alter table public.articles enable row level security;
create policy "articles readable by everyone"
  on public.articles for select using (true);
create policy "logged-in users can publish"
  on public.articles for insert with check (auth.uid() = author_id);
create policy "authors can update their own articles"
  on public.articles for update using (auth.uid() = author_id);
create policy "authors can delete their own articles"
  on public.articles for delete using (auth.uid() = author_id);

-- ---- CLAPS : one clap per user per article ---------------------------------
create table if not exists public.claps (
  user_id    uuid references auth.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);
alter table public.claps enable row level security;
create policy "claps readable by everyone"
  on public.claps for select using (true);
create policy "users clap as themselves"
  on public.claps for insert with check (auth.uid() = user_id);

-- ---- COMMENTS / responses ---------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references public.articles(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text,
  body        text not null,
  created_at  timestamptz default now()
);
alter table public.comments enable row level security;
create policy "comments readable by everyone"
  on public.comments for select using (true);
create policy "logged-in users can comment"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ---- FOLLOWS ----------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid references auth.users(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, author_id)
);
alter table public.follows enable row level security;
create policy "follows readable by everyone"
  on public.follows for select using (true);
create policy "users follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);
create policy "users unfollow themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- (Reads-count, bookmarks and membership stay client-side for now;
--  they can be moved here later if you want them shared across devices.)

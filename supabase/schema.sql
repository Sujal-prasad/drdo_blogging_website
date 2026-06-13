-- ===========================================================================
-- Midium — Supabase database schema  (SAFE TO RE-RUN — idempotent)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run.
-- Tables use "if not exists"; every policy is dropped-then-created, so you can
-- paste-and-run this whole file again any time without errors.
-- ===========================================================================

-- ---- PROFILES : one row per user (display name + avatar) -------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  updated_at   timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles readable by everyone" on public.profiles;
create policy "profiles readable by everyone" on public.profiles for select using (true);
drop policy if exists "users manage their own profile" on public.profiles;
create policy "users manage their own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---- ARTICLES : everyone's published posts ---------------------------------
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references auth.users(id) on delete set null,
  author_name text,
  title       text not null,
  dek         text,
  tag         text,
  accent      text,
  emoji       text,
  cover       text,
  body        text,
  created_at  timestamptz default now()
);
alter table public.articles enable row level security;
drop policy if exists "articles readable by everyone" on public.articles;
create policy "articles readable by everyone" on public.articles for select using (true);
drop policy if exists "logged-in users can publish" on public.articles;
create policy "logged-in users can publish" on public.articles
  for insert with check (auth.uid() = author_id);
drop policy if exists "authors can update their own articles" on public.articles;
create policy "authors can update their own articles" on public.articles
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "authors can delete their own articles" on public.articles;
create policy "authors can delete their own articles" on public.articles
  for delete using (auth.uid() = author_id);

-- ---- CLAPS : one clap per user per article ---------------------------------
create table if not exists public.claps (
  user_id    uuid references auth.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);
alter table public.claps enable row level security;
drop policy if exists "claps readable by everyone" on public.claps;
create policy "claps readable by everyone" on public.claps for select using (true);
drop policy if exists "users clap as themselves" on public.claps;
create policy "users clap as themselves" on public.claps
  for insert with check (auth.uid() = user_id);

-- ---- COMMENTS / responses --------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references public.articles(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text,
  body        text not null,
  created_at  timestamptz default now()
);
alter table public.comments enable row level security;
drop policy if exists "comments readable by everyone" on public.comments;
create policy "comments readable by everyone" on public.comments for select using (true);
drop policy if exists "logged-in users can comment" on public.comments;
create policy "logged-in users can comment" on public.comments
  for insert with check (auth.uid() = user_id);
drop policy if exists "users can delete their own comments" on public.comments;
create policy "users can delete their own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- ---- FOLLOWS ---------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid references auth.users(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, author_id)
);
alter table public.follows enable row level security;
drop policy if exists "follows readable by everyone" on public.follows;
create policy "follows readable by everyone" on public.follows for select using (true);
drop policy if exists "users follow as themselves" on public.follows;
create policy "users follow as themselves" on public.follows
  for insert with check (auth.uid() = follower_id);
drop policy if exists "users unfollow themselves" on public.follows;
create policy "users unfollow themselves" on public.follows
  for delete using (auth.uid() = follower_id);

-- Note: reads-count, bookmarks and membership stay client-side for the
-- simulated paywall. A *real* paywall would gate article bodies server-side
-- (don't expose `body` via a public SELECT to non-members).

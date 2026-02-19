-- =============================================
-- Smart Bookmark App — Supabase Schema Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create the bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) — users can only see their OWN bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Select: users can only read their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: users can only add bookmarks for themselves
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Delete: users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Enable Realtime on the bookmarks table
-- (Do this in Supabase dashboard: Database → Replication → enable bookmarks table)
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;

-- 5. Index for faster queries per user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id, created_at DESC);

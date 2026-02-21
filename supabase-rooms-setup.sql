-- Run this in Supabase SQL Editor (Dashboard > SQL Editor) to allow public access for demo.
-- Friends can join watch rooms via link without signing in.

-- Create rooms table if not exists
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY,
  video_id TEXT NOT NULL DEFAULT '',
  is_playing BOOLEAN NOT NULL DEFAULT false,
  last_timestamp DOUBLE PRECISION NOT NULL DEFAULT 0,
  host_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Allow public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Enable read for anon" ON public.rooms;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.rooms;
DROP POLICY IF EXISTS "Enable update for anon" ON public.rooms;

-- Public access: anyone with the link can read, create, and update rooms (demo mode)
CREATE POLICY "Allow public read rooms" ON public.rooms
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert rooms" ON public.rooms
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update rooms" ON public.rooms
  FOR UPDATE TO anon, authenticated USING (true);

-- Add rooms to Realtime for broadcast (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;

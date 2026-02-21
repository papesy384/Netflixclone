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

-- Add rooms to Realtime for postgres_changes (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;

-- Server-side broadcast: when rooms row updates, broadcast playback state to all clients.
-- Clients subscribe to channel 'room:{roomId}' and receive this via the broadcast listener.
-- Run this in Supabase SQL Editor. Requires realtime extension.
CREATE OR REPLACE FUNCTION public.broadcast_room_playback()
RETURNS trigger
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'is_playing', NEW.is_playing,
      'last_timestamp', NEW.last_timestamp
    ),
    'playback',
    'room:' || NEW.id::text,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rooms_playback_broadcast ON public.rooms;
CREATE TRIGGER rooms_playback_broadcast
  AFTER UPDATE OF is_playing, last_timestamp ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_room_playback();

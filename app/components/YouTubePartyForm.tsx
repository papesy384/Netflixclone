"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { parseYouTubeVideoId, youtubeWatchUrl } from "@/lib/youtube";

export default function YouTubePartyForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = parseYouTubeVideoId(value);
    if (!videoId) {
      setError("Paste a YouTube link (or video ID) to start a party.");
      return;
    }

    setError("");
    setLoading(true);
    const videoUrl = youtubeWatchUrl(videoId);
    const roomId = crypto.randomUUID();

    try {
      if (supabase) {
        const { error: insertError } = await supabase.from("rooms").insert({
          id: roomId,
          video_id: videoUrl,
          is_playing: false,
          last_timestamp: 0,
        });
        if (insertError) {
          console.error("Room create error:", insertError);
        }
      }
      router.push(`/watch/${roomId}?v=${encodeURIComponent(videoId)}`);
    } catch (err) {
      console.error(err);
      setError("Could not start the party. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-xl px-1">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <label htmlFor="youtube-url" className="sr-only">
          YouTube link
        </label>
        <input
          id="youtube-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="Paste a YouTube link to watch together"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          className="min-w-0 flex-1 rounded border border-white/20 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#E50914]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-[#E50914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f40612] disabled:opacity-60"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          {loading ? "Starting…" : "Start Party"}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-left text-xs text-red-400 sm:text-center" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

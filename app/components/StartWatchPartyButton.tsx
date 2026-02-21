"use client";

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

type StartWatchPartyButtonProps = {
  videoUrl?: string;
  variant?: "primary" | "card" | "compact";
  children?: React.ReactNode;
  className?: string;
};

export default function StartWatchPartyButton({
  videoUrl = DEFAULT_VIDEO,
  variant = "primary",
  children,
  className = "",
}: StartWatchPartyButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    const roomId = crypto.randomUUID();
    const videoIdOrUrl = videoUrl;

    if (supabase) {
      const { error } = await supabase.from("rooms").insert({
        id: roomId,
        video_id: videoIdOrUrl,
        is_playing: false,
        last_timestamp: 0,
      });
      if (error) {
        console.error("Room create error:", error);
        router.push(`/watch/${roomId}?u=${encodeURIComponent(videoUrl)}`);
        return;
      }
    }

    const query = `?u=${encodeURIComponent(videoUrl)}`;
    router.push(`/watch/${roomId}${query}`);
  };

  const baseClasses =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded bg-[#E50914] px-8 py-4 text-lg font-semibold text-white hover:bg-[#f40612] transition-all hover:scale-105 active:scale-100"
      : variant === "compact"
        ? "inline-flex items-center gap-2 rounded bg-[#E50914] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f40612] transition-colors"
        : "inline-flex w-fit items-center gap-1 rounded bg-[#E50914] px-2 py-1 text-xs font-medium text-white hover:bg-[#f40612]";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClasses} ${className}`}
    >
      {children ?? (
        <>
          <Play className="h-5 w-5" fill="currentColor" />
          Start Watch Party
        </>
      )}
    </button>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const BROADCAST_EVENT = "playback";

type RoomState = {
  is_playing: boolean;
  last_timestamp: number;
  host_id: string | null;
};

type VideoPlayerProps = {
  roomId: string;
  url: string;
  className?: string;
};

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("social-sofa-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("social-sofa-client-id", id);
  }
  return id;
}

function getYouTubeId(url: string): string | null {
  try {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url) || url.includes("commondatastorage.googleapis.com");
}

export default function VideoPlayer({ roomId, url, className = "" }: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const clientIdRef = useRef<string>("");
  const currentTimeRef = useRef(0);
  const isHostRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const roomsChannelRef = useRef<{ unsubscribe: () => void } | null>(null);

  const [effectiveUrl, setEffectiveUrl] = useState(url);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const isRemoteUpdateRef = useRef(false);

  const safeSeek = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) {
      pendingSeekRef.current = seconds;
      return;
    }
    if (typeof player.seekTo === "function") {
      player.seekTo(seconds, "seconds");
    } else if (typeof (player as HTMLVideoElement).currentTime !== "undefined") {
      (player as HTMLVideoElement).currentTime = seconds;
    } else {
      pendingSeekRef.current = seconds;
    }
  }, []);

  const syncFromRoom = useCallback(
    (state: RoomState) => {
      setIsPlaying(state.is_playing);
      currentTimeRef.current = state.last_timestamp;
      pendingSeekRef.current = state.last_timestamp;
      safeSeek(state.last_timestamp);
    },
    [safeSeek]
  );

  const broadcastPlayback = useCallback(
    async (is_playing: boolean, last_timestamp: number) => {
      if (!supabase) return;
      const channel = channelRef.current;
      if (!channel) return;

      await supabase
        .from("rooms")
        .update({ is_playing, last_timestamp })
        .eq("id", roomId);

      const payload = {
        is_playing,
        last_timestamp,
        client_id: clientIdRef.current,
      };
      channel.send({
        type: "broadcast",
        event: BROADCAST_EVENT,
        payload,
      });
    },
    [roomId]
  );

  useEffect(() => {
    clientIdRef.current = getOrCreateClientId();
  }, []);

  useEffect(() => {
    setEffectiveUrl(url);
    setHasError(false);
  }, [url]);

  // Sync isPlaying to native video element (broadcast from friend -> play on your device)
  useEffect(() => {
    const el = playerRef.current;
    if (!el || !isDirectVideoUrl(effectiveUrl)) return;
    const video = el as HTMLVideoElement;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, effectiveUrl]);

  // Drift management: broadcast current position every 5s when playing (PRD)
  useEffect(() => {
    if (!isPlaying || !isHostRef.current) return;
    const interval = setInterval(() => {
      if (isRemoteUpdateRef.current) return;
      const t = currentTimeRef.current;
      if (t > 0) broadcastPlayback(true, t);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, broadcastPlayback]);

  // Fetch room state and subscribe to broadcast (runs in background, never blocks video)
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;
    const clientId = clientIdRef.current;

    const run = async () => {
      const { data: room, error } = await client
        .from("rooms")
        .select("is_playing, last_timestamp, host_id, video_id")
        .eq("id", roomId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Room fetch error:", error);
        setRoomError(error.message ?? "Could not load room.");
        return;
      }

      let isHost = false;
      const videoIdFromUrl = getYouTubeId(url);
      const videoIdOrUrl = videoIdFromUrl ?? url; // Store full URL for direct videos
      if (!room) {
        const { error: insertError } = await client.from("rooms").insert({
          id: roomId,
          video_id: videoIdOrUrl,
          is_playing: false,
          last_timestamp: 0,
          host_id: clientId,
        });
        if (!insertError) isHost = true;
      } else {
        if (room.host_id === clientId) isHost = true;
        syncFromRoom({
          is_playing: room.is_playing ?? false,
          last_timestamp: room.last_timestamp ?? 0,
          host_id: room.host_id,
        });
        const roomVideoId = (room as { video_id?: string }).video_id;
        if (roomVideoId) {
          const resolvedUrl = roomVideoId.startsWith("http") ? roomVideoId : `https://www.youtube.com/watch?v=${roomVideoId}`;
          setEffectiveUrl(resolvedUrl);
        } else {
          await client
            .from("rooms")
            .update({ video_id: videoIdOrUrl })
            .eq("id", roomId);
        }
      }
      isHostRef.current = isHost;
      setIsHost(isHost);

      const channel = client.channel(`room:${roomId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: BROADCAST_EVENT }, (payload: { payload?: Record<string, unknown>; [key: string]: unknown }) => {
            if (!mounted) return;
            const data = (payload.payload ?? payload) as { is_playing?: boolean; last_timestamp?: number; client_id?: string };
            const is_playing = data?.is_playing;
            const last_timestamp = data?.last_timestamp ?? 0;
            const client_id = data?.client_id;
            if (client_id === clientId) return;
            isRemoteUpdateRef.current = true;
            if (is_playing !== undefined) setIsPlaying(is_playing);
            currentTimeRef.current = last_timestamp;
            safeSeek(last_timestamp);
            setTimeout(() => { isRemoteUpdateRef.current = false; }, 500);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED" && !mounted) return;
        });

      const roomsChannel = client
        .channel(`rooms-changes:${roomId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
          (payload) => {
            if (!mounted) return;
            const newRow = payload.new as { is_playing?: boolean; last_timestamp?: number };
            if (newRow?.is_playing !== undefined || newRow?.last_timestamp !== undefined) {
              isRemoteUpdateRef.current = true;
              if (newRow.is_playing !== undefined) setIsPlaying(newRow.is_playing);
              if (newRow.last_timestamp !== undefined) {
                currentTimeRef.current = newRow.last_timestamp;
                safeSeek(newRow.last_timestamp);
              }
              setTimeout(() => { isRemoteUpdateRef.current = false; }, 500);
            }
          }
        )
        .subscribe();
      roomsChannelRef.current = roomsChannel;
    };

    run();
    return () => {
      mounted = false;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      roomsChannelRef.current?.unsubscribe();
      roomsChannelRef.current = null;
    };
  }, [roomId, syncFromRoom, safeSeek, url]);

  const handlePlay = useCallback(() => {
    if (isRemoteUpdateRef.current) return;
    setIsPlaying(true);
    if (initialSyncDone) {
      const t = currentTimeRef.current;
      broadcastPlayback(true, t);
    }
  }, [initialSyncDone, broadcastPlayback]);

  const handlePause = useCallback(() => {
    if (isRemoteUpdateRef.current) return;
    setIsPlaying(false);
    if (initialSyncDone) {
      const t = currentTimeRef.current;
      broadcastPlayback(false, t);
    }
  }, [initialSyncDone, broadcastPlayback]);

  const handleProgress = useCallback(
    (state: { playedSeconds: number }) => {
      currentTimeRef.current = state.playedSeconds;
    },
    []
  );

  const handleSeeked = useCallback(() => {
    if (initialSyncDone) {
      const t = currentTimeRef.current;
      broadcastPlayback(isPlaying, t);
    }
  }, [initialSyncDone, isPlaying, broadcastPlayback]);

  const handleReady = useCallback(() => {
    const pending = pendingSeekRef.current;
    if (pending !== null) {
      safeSeek(pending);
      pendingSeekRef.current = null;
    }
  }, [safeSeek]);

  const handleVideoCanPlay = useCallback(() => {
    const pending = pendingSeekRef.current;
    if (pending !== null && playerRef.current && "currentTime" in playerRef.current) {
      (playerRef.current as HTMLVideoElement).currentTime = pending;
      pendingSeekRef.current = null;
    }
  }, []);

  return (
    <div className={`relative aspect-video w-full bg-black ${className}`}>
      {!supabase && (
        <div className="absolute left-0 right-0 top-0 z-10 bg-amber-500/90 px-3 py-2 text-center text-sm text-black">
          Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel to enable sync.
        </div>
      )}
      {roomError && (
        <div className="absolute left-0 right-0 top-0 z-10 bg-amber-500/90 px-3 py-2 text-center text-xs text-black">
          {roomError} — Sync disabled. Video may still play below.
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-4 text-center text-white">
          <p className="text-sm">This video can&apos;t be played (embed may be restricted).</p>
          <p className="mt-2 text-xs text-white/70">Try another movie from the home page.</p>
        </div>
      )}
      {isDirectVideoUrl(effectiveUrl) ? (
        <video
          ref={playerRef as React.RefObject<HTMLVideoElement>}
          src={effectiveUrl}
          controls
          playsInline
          className="absolute inset-0 h-full w-full"
          onCanPlay={handleVideoCanPlay}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={(e) => {
            currentTimeRef.current = e.currentTarget.currentTime;
          }}
          onSeeked={() => handleSeeked()}
          onError={() => setHasError(true)}
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={effectiveUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls
          className="absolute inset-0"
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={() => setHasError(true)}
          // @ts-expect-error react-player types extend HTMLVideoElement; onProgress actually receives { playedSeconds }
          onProgress={handleProgress}
          onSeeked={handleSeeked}
        />
      )}
    </div>
  );
}

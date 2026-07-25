"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { parseYouTubeVideoId } from "@/lib/youtube";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const BROADCAST_EVENT = "playback";
/** Only force-seek when a guest is this many seconds off the host. */
const DRIFT_THRESHOLD_SEC = 2;
/** YouTube seeks are heavier — allow a bit more drift before correcting. */
const YOUTUBE_DRIFT_THRESHOLD_SEC = 2.5;
/** How often the host shares their position (guests correct only if drifted). */
const HEARTBEAT_MS = 8000;

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

function isDirectVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url) ||
    url.includes("commondatastorage.googleapis.com")
  );
}

function isYouTubeUrl(url: string): boolean {
  return Boolean(parseYouTubeVideoId(url));
}

export default function VideoPlayer({ roomId, url, className = "" }: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const clientIdRef = useRef<string>("");
  const currentTimeRef = useRef(0);
  const isHostRef = useRef(false);
  const isPlayingRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const suppressUntilRef = useRef(0);
  const lastBroadcastAtRef = useRef(0);

  const [effectiveUrl, setEffectiveUrl] = useState(url);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomReady, setRoomReady] = useState(false);
  const [needsUserClickToPlay, setNeedsUserClickToPlay] = useState(false);
  const pendingSeekRef = useRef<number | null>(null);

  const suppressRemoteEcho = useCallback((ms = 900) => {
    suppressUntilRef.current = Date.now() + ms;
  }, []);

  const isSuppressed = useCallback(() => Date.now() < suppressUntilRef.current, []);

  const safeSeek = useCallback((seconds: number, force = false) => {
    const player = playerRef.current;
    if (!player) {
      pendingSeekRef.current = seconds;
      return;
    }

    const local = currentTimeRef.current;
    const drift = Math.abs(local - seconds);
    const threshold = isYouTubeUrl(effectiveUrl)
      ? YOUTUBE_DRIFT_THRESHOLD_SEC
      : DRIFT_THRESHOLD_SEC;

    // Skip tiny corrections — these are what make playback feel jumpy
    if (!force && drift < threshold) {
      return;
    }

    suppressRemoteEcho(1200);
    if (typeof player.seekTo === "function") {
      player.seekTo(seconds, "seconds");
    } else if (typeof (player as HTMLVideoElement).currentTime !== "undefined") {
      (player as HTMLVideoElement).currentTime = seconds;
    } else {
      pendingSeekRef.current = seconds;
      return;
    }
    currentTimeRef.current = seconds;
  }, [effectiveUrl, suppressRemoteEcho]);

  const applyRemoteState = useCallback(
    (state: { is_playing?: boolean; last_timestamp?: number }, opts?: { forceSeek?: boolean }) => {
      if (typeof state.is_playing === "boolean" && state.is_playing !== isPlayingRef.current) {
        suppressRemoteEcho(900);
        isPlayingRef.current = state.is_playing;
        setIsPlaying(state.is_playing);
      }
      if (typeof state.last_timestamp === "number") {
        safeSeek(state.last_timestamp, opts?.forceSeek ?? false);
      }
    },
    [safeSeek, suppressRemoteEcho]
  );

  const broadcastPlayback = useCallback(
    async (is_playing: boolean, last_timestamp: number, opts?: { persist?: boolean }) => {
      if (!supabase) return;
      const channel = channelRef.current;
      if (!channel) return;

      // Throttle noisy heartbeats a bit
      const now = Date.now();
      if (now - lastBroadcastAtRef.current < 400) return;
      lastBroadcastAtRef.current = now;

      const persist = opts?.persist !== false;
      if (persist) {
        // Fire-and-forget DB write — don't block the broadcast (smoother UX)
        void supabase
          .from("rooms")
          .update({ is_playing, last_timestamp })
          .eq("id", roomId);
      }

      channel.send({
        type: "broadcast",
        event: BROADCAST_EVENT,
        payload: {
          is_playing,
          last_timestamp,
          client_id: clientIdRef.current,
        },
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

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Sync isPlaying to native video element (broadcast from friend -> play on your device)
  useEffect(() => {
    const el = playerRef.current;
    if (!el || !isDirectVideoUrl(effectiveUrl)) return;
    const video = el as HTMLVideoElement;
    if (isPlaying) {
      video
        .play()
        .then(() => setNeedsUserClickToPlay(false))
        .catch(() => {
          video.muted = true;
          video
            .play()
            .then(() => setNeedsUserClickToPlay(false))
            .catch(() => setNeedsUserClickToPlay(true));
        });
    } else {
      setNeedsUserClickToPlay(false);
      video.pause();
    }
  }, [isPlaying, effectiveUrl]);

  // Host heartbeat: share position; guests only seek if they drifted past the threshold
  useEffect(() => {
    if (!isPlaying || !isHostRef.current) return;
    const interval = setInterval(() => {
      if (isSuppressed()) return;
      const t = currentTimeRef.current;
      if (t >= 0) {
        // Heartbeats don't need a DB write every tick — broadcast is enough for live sync
        void broadcastPlayback(true, t, { persist: false });
      }
    }, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [isPlaying, broadcastPlayback, isSuppressed]);

  // Fetch room state + realtime broadcast (primary sync path)
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setRoomReady(true);
      return;
    }

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
        setRoomReady(true);
        return;
      }

      let host = false;
      const videoIdFromUrl = parseYouTubeVideoId(url);
      const videoIdOrUrl = videoIdFromUrl ?? url;

      if (!room) {
        const { error: insertError } = await client.from("rooms").insert({
          id: roomId,
          video_id: videoIdOrUrl,
          is_playing: false,
          last_timestamp: 0,
          host_id: clientId,
        });
        if (!insertError) host = true;
      } else {
        if (room.host_id === clientId) host = true;

        // Initial join: snap hard to host position once
        isPlayingRef.current = room.is_playing ?? false;
        setIsPlaying(room.is_playing ?? false);
        currentTimeRef.current = room.last_timestamp ?? 0;
        pendingSeekRef.current = room.last_timestamp ?? 0;
        safeSeek(room.last_timestamp ?? 0, true);

        const roomVideoId = (room as { video_id?: string }).video_id;
        if (roomVideoId) {
          const ytId = parseYouTubeVideoId(roomVideoId);
          const resolvedUrl = roomVideoId.startsWith("http")
            ? roomVideoId
            : ytId
              ? `https://www.youtube.com/watch?v=${ytId}`
              : `https://www.youtube.com/watch?v=${roomVideoId}`;
          setEffectiveUrl(resolvedUrl);
        } else {
          await client.from("rooms").update({ video_id: videoIdOrUrl }).eq("id", roomId);
        }
      }

      isHostRef.current = host;
      setIsHost(host);

      const channel = client.channel(`room:${roomId}`);
      channelRef.current = channel;

      channel
        .on(
          "broadcast",
          { event: BROADCAST_EVENT },
          (payload: { payload?: Record<string, unknown>; [key: string]: unknown }) => {
            if (!mounted) return;
            const data = (payload.payload ?? payload) as {
              is_playing?: boolean;
              last_timestamp?: number;
              client_id?: string;
            };
            if (data.client_id === clientId) return;
            if (isHostRef.current) return; // host timeline is source of truth

            applyRemoteState(
              {
                is_playing: data.is_playing,
                last_timestamp: data.last_timestamp,
              },
              { forceSeek: false }
            );
          }
        )
        .subscribe();

      setRoomReady(true);
    };

    run();
    return () => {
      mounted = false;
      setRoomReady(false);
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, safeSeek, applyRemoteState, url]);

  const handlePlay = useCallback(() => {
    if (isSuppressed()) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    if (isHostRef.current) {
      void broadcastPlayback(true, currentTimeRef.current, { persist: true });
    }
  }, [broadcastPlayback, isSuppressed]);

  const handlePause = useCallback(() => {
    if (isSuppressed()) return;
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (isHostRef.current) {
      void broadcastPlayback(false, currentTimeRef.current, { persist: true });
    }
  }, [broadcastPlayback, isSuppressed]);

  const handleEnded = useCallback(() => {
    if (isSuppressed()) return;
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (isHostRef.current) {
      void broadcastPlayback(false, currentTimeRef.current, { persist: true });
    }
  }, [broadcastPlayback, isSuppressed]);

  const handleSeeked = useCallback(() => {
    if (isSuppressed()) return;
    if (!isHostRef.current) return;
    void broadcastPlayback(isPlayingRef.current, currentTimeRef.current, { persist: true });
  }, [broadcastPlayback, isSuppressed]);

  const handleReady = useCallback(() => {
    const pending = pendingSeekRef.current;
    if (pending !== null) {
      safeSeek(pending, true);
      pendingSeekRef.current = null;
    }
  }, [safeSeek]);

  const handleEmbeddedTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      currentTimeRef.current = e.currentTarget.currentTime;
    },
    []
  );

  const handleVideoCanPlay = useCallback(() => {
    const pending = pendingSeekRef.current;
    if (pending !== null && playerRef.current && "currentTime" in playerRef.current) {
      suppressRemoteEcho(1200);
      (playerRef.current as HTMLVideoElement).currentTime = pending;
      pendingSeekRef.current = null;
    }
  }, [suppressRemoteEcho]);

  const handleUserClickToPlay = useCallback(() => {
    setNeedsUserClickToPlay(false);
    const el = playerRef.current;
    if (el && isDirectVideoUrl(effectiveUrl)) {
      (el as HTMLVideoElement).play().catch(() => setNeedsUserClickToPlay(true));
    }
  }, [effectiveUrl]);

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
      {!roomReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
        </div>
      )}
      {needsUserClickToPlay && roomReady && (
        <button
          type="button"
          onClick={handleUserClickToPlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 transition-colors hover:bg-black/60"
        >
          <span className="rounded bg-[#E50914] px-6 py-3 text-sm font-semibold text-white">
            Click to sync with party
          </span>
        </button>
      )}
      {isHost && roomReady && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded bg-black/60 px-2 py-1 text-[10px] text-white/80">
          Host · sync on
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
          onEnded={handleEnded}
          onError={() => setHasError(true)}
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          src={effectiveUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls
          playsInline
          style={{ position: "absolute", inset: 0 }}
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={() => setHasError(true)}
          onTimeUpdate={handleEmbeddedTimeUpdate}
          onSeeked={handleSeeked}
        />
      )}
    </div>
  );
}

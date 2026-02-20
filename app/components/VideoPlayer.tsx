"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

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

export default function VideoPlayer({ roomId, url, className = "" }: VideoPlayerProps) {
  const playerRef = useRef<import("react-player").default>(null);
  const clientIdRef = useRef<string>("");
  const currentTimeRef = useRef(0);
  const isHostRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const pendingSeekRef = useRef<number | null>(null);

  const syncFromRoom = useCallback((state: RoomState) => {
    setIsPlaying(state.is_playing);
    currentTimeRef.current = state.last_timestamp;
    pendingSeekRef.current = state.last_timestamp;
    playerRef.current?.seekTo(state.last_timestamp, "seconds");
  }, []);

  const broadcastPlayback = useCallback(
    async (is_playing: boolean, last_timestamp: number) => {
      const channel = channelRef.current;
      if (!channel || !isHostRef.current) return;

      await supabase
        .from("rooms")
        .update({ is_playing, last_timestamp })
        .eq("id", roomId);

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

  // Fetch room state and subscribe to broadcast
  useEffect(() => {
    let mounted = true;
    const clientId = clientIdRef.current;

    const run = async () => {
      const { data: room, error } = await supabase
        .from("rooms")
        .select("is_playing, last_timestamp, host_id")
        .eq("id", roomId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Room fetch error:", error);
        setInitialSyncDone(true);
        return;
      }

      let isHost = false;
      if (!room) {
        const { error: insertError } = await supabase.from("rooms").insert({
          id: roomId,
          video_id: "",
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
      }
      isHostRef.current = isHost;
      setInitialSyncDone(true);

      const channel = supabase.channel(`room:${roomId}`);
      channelRef.current = channel;

      channel
        .on(
          "broadcast",
          { event: BROADCAST_EVENT },
          (payload: { payload: { is_playing: boolean; last_timestamp: number; client_id?: string } }) => {
            if (!mounted) return;
            const { is_playing, last_timestamp, client_id } = payload.payload;
            if (client_id === clientId) return;
            setIsPlaying(is_playing);
            currentTimeRef.current = last_timestamp;
            playerRef.current?.seekTo(last_timestamp, "seconds");
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED" && !mounted) return;
        });
    };

    run();
    return () => {
      mounted = false;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, syncFromRoom]);

  const handlePlay = useCallback(() => {
    if (!initialSyncDone || !isHostRef.current) return;
    const t = currentTimeRef.current;
    broadcastPlayback(true, t);
    setIsPlaying(true);
  }, [initialSyncDone, broadcastPlayback]);

  const handlePause = useCallback(() => {
    if (!initialSyncDone || !isHostRef.current) return;
    const t = currentTimeRef.current;
    broadcastPlayback(false, t);
    setIsPlaying(false);
  }, [initialSyncDone, broadcastPlayback]);

  const handleProgress = useCallback(
    (state: { playedSeconds: number }) => {
      currentTimeRef.current = state.playedSeconds;
    },
    []
  );

  const handleSeeked = useCallback(() => {
    if (!initialSyncDone || !isHostRef.current) return;
    const t = currentTimeRef.current;
    broadcastPlayback(isPlaying, t);
  }, [initialSyncDone, isPlaying, broadcastPlayback]);

  const handleReady = useCallback(() => {
    const pending = pendingSeekRef.current;
    if (pending !== null && playerRef.current) {
      playerRef.current.seekTo(pending, "seconds");
      pendingSeekRef.current = null;
    }
  }, []);

  return (
    <div className={`relative aspect-video w-full bg-black ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls
        className="absolute inset-0"
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onSeeked={handleSeeked}
      />
    </div>
  );
}

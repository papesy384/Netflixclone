"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ChatSidebar, { ChatToggleButton } from "./ChatSidebar";

type WatchRoomProps = {
  roomId: string;
  videoUrl?: string;
};

const DEFAULT_VIDEO = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export default function WatchRoom({ roomId, videoUrl = DEFAULT_VIDEO }: WatchRoomProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/watch/${roomId}` : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      setCopied(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Video column */}
      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <button
          type="button"
          onClick={handleCopyLink}
          className="mb-3 flex w-fit items-center gap-2 self-end rounded bg-[#e50914] px-3 py-2 text-sm font-medium text-white hover:bg-[#f40612]"
        >
          <Link2 className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Invite Link"}
        </button>
        <VideoPlayer roomId={roomId} url={videoUrl} className="rounded overflow-hidden" />
      </div>

      {/* Chat: sidebar on desktop, overlay on mobile */}
      <div className="hidden w-full md:block md:max-w-[380px] md:flex-shrink-0 md:border-l md:border-white/10">
        <ChatSidebar roomId={roomId} className="h-full" />
      </div>

      {/* Mobile chat overlay */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close chat"
            onClick={() => setChatOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-white/10 shadow-2xl"
            role="dialog"
            aria-label="Chat"
          >
            <ChatSidebar
              roomId={roomId}
              className="h-full"
              isOverlay
              onCloseOverlay={() => setChatOpen(false)}
            />
          </div>
        </div>
      )}

      <ChatToggleButton onClick={() => setChatOpen(true)} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Link2, Mail, MessageCircle, Share2 } from "lucide-react";
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

  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/watch/${roomId}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareSubject = "Join my watch party - The Social Sofa";
  const shareBody = `Join me watching together!\n\n${inviteUrl}\n\nClick the link to join the room and watch in sync.`;

  const handleShareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`;
  };

  const handleShareViaGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareViaSms = () => {
    window.location.href = `sms:?body=${encodeURIComponent(`${shareSubject}\n\n${inviteUrl}`)}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareSubject,
          text: shareBody,
          url: inviteUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Share banner - prominent at top */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-4 py-3 md:absolute md:left-0 md:right-0 md:top-0 md:z-10 md:border-0 md:bg-gradient-to-b md:from-black/80 md:to-transparent md:px-6 md:py-4">
        <span className="text-sm text-white/90">Share this link to invite friends</span>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShareViaSms}
            className="flex items-center gap-2 rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            title="Share via SMS"
          >
            <MessageCircle className="h-4 w-4" />
            SMS
          </button>
          <button
            type="button"
            onClick={handleShareViaEmail}
            className="flex items-center gap-2 rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            title="Share via email"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            type="button"
            onClick={handleShareViaGmail}
            className="flex items-center gap-2 rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ea4335] hover:border-[#ea4335]"
            title="Share via Gmail"
          >
            <Share2 className="h-4 w-4" />
            Gmail
          </button>
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-2 rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 md:hidden"
            title="Share (phone native)"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded bg-[#e50914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f40612]"
          >
            <Link2 className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Video column */}
      <div className="flex min-h-0 flex-1 flex-col p-4 pt-14 md:p-6 md:pt-20">
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

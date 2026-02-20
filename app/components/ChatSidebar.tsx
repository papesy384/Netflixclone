"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

type ChatSidebarProps = {
  roomId: string;
  className?: string;
  isOverlay?: boolean;
  onCloseOverlay?: () => void;
};

export default function ChatSidebar({
  roomId,
  className = "",
  isOverlay = false,
  onCloseOverlay,
}: ChatSidebarProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: send via Supabase Realtime
    setMessage("");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#1a1a1a]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold text-white">Chat</h2>
        {isOverlay && onCloseOverlay && (
          <button
            type="button"
            onClick={onCloseOverlay}
            className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-center text-sm text-white/50">
          Room: {roomId}. Messages will appear here.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#e50914]"
            aria-label="Message"
          />
          <button
            type="submit"
            className="rounded bg-[#e50914] px-4 py-2 text-sm font-medium text-white hover:bg-[#f40612]"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <aside
      className={className}
      style={isOverlay ? undefined : undefined}
      aria-label="Chat sidebar"
    >
      {sidebar}
    </aside>
  );
}

export function ChatToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg hover:bg-[#f40612] md:hidden"
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}

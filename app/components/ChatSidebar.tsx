"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  room_id: string;
  user_name: string;
  content: string;
  created_at: string;
};

type ChatSidebarProps = {
  roomId: string;
  className?: string;
  isOverlay?: boolean;
  onCloseOverlay?: () => void;
};

function getDisplayName(): string {
  if (typeof window === "undefined") return "Guest";
  let name = localStorage.getItem("social-sofa-display-name");
  if (!name) {
    name = `Guest${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("social-sofa-display-name", name);
  }
  return name;
}

export default function ChatSidebar({
  roomId,
  className = "",
  isOverlay = false,
  onCloseOverlay,
}: ChatSidebarProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const displayNameRef = useRef("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    displayNameRef.current = getDisplayName();
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const fetchMessages = async () => {
      const { data, error } = await client
        .from("messages")
        .select("id, room_id, user_name, content, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data as Message[]);
    };

    fetchMessages();

    const channel = client
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newRow = payload.new as Message;
          setMessages((prev) => [...prev, newRow]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = message.trim();
      setSendError(null);
      if (!text || !supabase) {
        if (!supabase) setSendError("Chat unavailable. Configure Supabase.");
        return;
      }

      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        user_name: displayNameRef.current,
        content: text,
      });
      if (error) {
        setSendError(error.message ?? "Failed to send. Try again.");
        return;
      }
      setMessage("");
    },
    [message, roomId]
  );

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
        {!supabase ? (
          <p className="text-center text-sm text-white/50">
            Configure Supabase in Vercel to enable chat.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-white/50">
            No messages yet. Say hello!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded bg-white/5 px-3 py-2"
              >
                <span className="text-xs font-medium text-[#e50914]">
                  {m.user_name}
                </span>
                <p className="mt-0.5 text-sm text-white">{m.content}</p>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
        {sendError && (
          <p className="mb-2 text-xs text-red-400" role="alert">
            {sendError}
          </p>
        )}
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
            className="rounded bg-[#e50914] px-4 py-2 text-sm font-medium text-white hover:bg-[#f40612] disabled:opacity-50"
            disabled={!supabase}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <aside className={className} aria-label="Chat sidebar">
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

import Link from "next/link";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          The Social Sofa
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80 sm:text-xl">
          Watch together in sync. Start a party, share the link, and stay on the same frame.
        </p>
        <Link
          href="/watch/new"
          className="mt-10 inline-flex items-center gap-2 rounded bg-[#e50914] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#f40612]"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          Start Party
        </Link>
      </section>

      {/* Footer note */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        Pick a video in the room and invite friends with the link.
      </footer>
    </div>
  );
}

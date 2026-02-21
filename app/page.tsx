import Link from "next/link";
import { MOCK_MOVIES } from "@/lib/mock-movies";
import MovieCard from "./components/MovieCard";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#141414]">
      {/* Netflix-style background: faded poster collage */}
      <div
        className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px opacity-25"
        aria-hidden
      >
        {[...MOCK_MOVIES, ...MOCK_MOVIES].slice(0, 24).map((movie, i) => (
          <div
            key={`bg-${movie.id}-${i}`}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.poster})` }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 90% 70% at 50% 25%, transparent 30%, #141414 85%)",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#141414]/60 via-[#141414]/20 to-[#141414]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
      {/* Hero - Netflix-style copy */}
      <section className="flex shrink-0 flex-col items-center justify-center px-4 py-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          Unlimited movies, TV shows, and more.
        </h1>
        <p className="mt-2 max-w-lg text-xs text-white/90 sm:text-sm md:text-base">
          Watch together in sync. Free. Invite anyone with a link.
        </p>
        <p className="mt-3 text-xs text-white/70 sm:text-sm">
          Ready to watch? Pick your favorite movie, start a watch party and invite your friends.
        </p>
      </section>

      {/* Trending Now - one row */}
      <section className="shrink-0 px-4">
        <h2 className="mb-1 text-xs font-semibold text-white sm:text-sm">
          Trending Now
        </h2>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2" style={{ height: "24vh" }}>
          {MOCK_MOVIES.slice(0, 5).map((movie) => (
            <MovieCard key={movie.id} movie={movie} compact />
          ))}
        </div>
      </section>

      {/* Popular Picks - one row */}
      <section className="shrink-0 px-4 py-1">
        <h2 className="mb-1 text-xs font-semibold text-white sm:text-sm">
          Popular Picks
        </h2>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2" style={{ height: "24vh" }}>
          {MOCK_MOVIES.slice(5, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} compact />
          ))}
        </div>
      </section>

      <footer className="mt-auto shrink-0 border-t border-white/10 py-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-center">
          <span className="text-[10px] text-white/60 sm:text-xs">
            The Social Sofa you love. Watch in sync with friends, free.
          </span>
          <Link href="/" className="text-[10px] font-medium text-white/90 underline sm:text-xs">
            Learn more
          </Link>
        </div>
      </footer>
      </div>
    </div>
  );
}

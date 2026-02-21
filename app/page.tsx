import { MOCK_MOVIES } from "@/lib/mock-movies";
import StartWatchPartyButton from "./components/StartWatchPartyButton";
import MovieCard from "./components/MovieCard";

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#141414]">
      {/* Hero - compact, single-screen */}
      <section className="flex shrink-0 flex-col items-center justify-center px-4 py-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          Watch together.
        </h1>
        <p className="mt-1 max-w-lg text-xs text-white/80 sm:text-sm md:text-base">
          Sync playback across devices. Invite friends with a link. Chat in real time.
        </p>
        <StartWatchPartyButton
          className="mt-3"
          videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
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

      <footer className="mt-auto shrink-0 border-t border-white/10 py-1.5 text-center text-[10px] text-white/50 sm:text-xs">
        Invite friends with the link. Watch together in sync.
      </footer>
    </div>
  );
}

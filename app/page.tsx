import { MOCK_MOVIES } from "@/lib/mock-movies";
import StartWatchPartyButton from "./components/StartWatchPartyButton";
import MovieCard from "./components/MovieCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
          Watch together.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/80 sm:text-xl md:text-2xl">
          Sync playback across devices. Invite friends with a link. Chat in real time.
        </p>
        <StartWatchPartyButton
          className="mt-10"
          videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </section>

      {/* Featured row */}
      <section className="px-6 pb-8">
        <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
          Trending Now
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MOCK_MOVIES.slice(0, 5).map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Second row */}
      <section className="px-6 pb-12">
        <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
          Popular Picks
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MOCK_MOVIES.slice(5).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        Invite friends with the link. Watch together in sync.
      </footer>
    </div>
  );
}

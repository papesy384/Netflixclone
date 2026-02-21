import Link from "next/link";
import { Play } from "lucide-react";
import { MOCK_MOVIES } from "@/lib/mock-movies";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero */}
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          The Social Sofa
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80 sm:text-xl">
          Watch together in sync. Pick a movie and start a party.
        </p>
        <Link
          href="/watch/new"
          className="mt-8 inline-flex items-center gap-2 rounded bg-[#e50914] px-8 py-4 text-lg font-semibold text-white hover:bg-[#f40612]"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          Watch now
        </Link>
      </section>

      {/* Movie grid */}
      <section className="px-6 pb-12">
        <h2 className="mb-6 text-2xl font-semibold text-white">Trending Now</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MOCK_MOVIES.map((movie, i) => (
            <Link
              key={movie.id}
              href={`/watch/new?u=${encodeURIComponent(movie.videoUrl)}`}
              className="group relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 transition-transform hover:scale-105"
            >
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover"
                priority={i < 6}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/AL2k6DY2enW1tbW6xxRRqiKOgAMAfirtFFZnYk5M/9k="
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="font-semibold text-white">{movie.title}</span>
                <span className="text-sm text-white/70">{movie.year}</span>
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded bg-[#e50914] px-2 py-1 text-xs font-medium text-white">
                  <Play className="h-3 w-3" fill="currentColor" />
                  Start Party
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        Invite friends with the link. Watch together in sync.
      </footer>
    </div>
  );
}

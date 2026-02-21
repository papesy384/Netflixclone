"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import StartWatchPartyButton from "./StartWatchPartyButton";
import type { MockMovie } from "@/lib/mock-movies";

export default function MovieCard({ movie }: { movie: MockMovie }) {
  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 transition-transform hover:scale-105">
      <Image
        src={movie.poster}
        alt={movie.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEA/AL2k6DY2enW1tbW6xxRRqiKOgAMAfirtFFZnYk5M/9k="
      />
      <div className="absolute inset-0 cursor-pointer bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <span className="font-semibold text-white">{movie.title}</span>
          <span className="text-sm text-white/70">{movie.year}</span>
          <div className="mt-2">
            <StartWatchPartyButton videoUrl={movie.videoUrl} variant="card">
              <Play className="h-3 w-3" fill="currentColor" />
              Start Party
            </StartWatchPartyButton>
          </div>
        </div>
      </div>
    </div>
  );
}

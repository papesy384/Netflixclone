import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ v?: string; u?: string }>;
};

export default async function NewRoomPage({ searchParams }: PageProps) {
  const { v: videoId, u: videoUrl } = await searchParams;
  const roomId = crypto.randomUUID();
  const query = videoUrl ? `?u=${encodeURIComponent(videoUrl)}` : videoId ? `?v=${videoId}` : "";
  redirect(`/watch/${roomId}${query}`);
}

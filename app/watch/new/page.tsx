import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ v?: string }>;
};

export default async function NewRoomPage({ searchParams }: PageProps) {
  const { v: videoId } = await searchParams;
  const roomId = crypto.randomUUID();
  const query = videoId ? `?v=${videoId}` : "";
  redirect(`/watch/${roomId}${query}`);
}

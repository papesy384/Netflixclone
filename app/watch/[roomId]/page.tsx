import WatchRoom from "@/app/components/WatchRoom";

const DEFAULT_VIDEO = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

type PageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ v?: string }>;
};

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { roomId } = await params;
  const { v: videoId } = await searchParams;
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : DEFAULT_VIDEO;
  return <WatchRoom roomId={roomId} videoUrl={videoUrl} />;
}

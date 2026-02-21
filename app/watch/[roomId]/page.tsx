import WatchRoom from "@/app/components/WatchRoom";

const DEFAULT_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

type PageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ v?: string; u?: string }>;
};

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { roomId } = await params;
  const { v: videoId, u: directUrl } = await searchParams;
  const videoUrl = directUrl
    ? decodeURIComponent(directUrl)
    : videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : DEFAULT_VIDEO;
  return <WatchRoom roomId={roomId} videoUrl={videoUrl} />;
}

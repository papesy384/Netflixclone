import WatchRoom from "@/app/components/WatchRoom";

type PageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function WatchPage({ params }: PageProps) {
  const { roomId } = await params;
  return <WatchRoom roomId={roomId} />;
}

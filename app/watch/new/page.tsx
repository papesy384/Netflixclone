import { redirect } from "next/navigation";

export default function NewRoomPage() {
  const roomId = crypto.randomUUID();
  redirect(`/watch/${roomId}`);
}

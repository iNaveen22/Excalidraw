import { RoomCanvas } from "@/components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  console.log("room id is hereee", roomId);

  return <RoomCanvas roomId={roomId} />;
}
 
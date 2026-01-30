"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (socketRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found");
        return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket closed");
      socketRef.current = null;
    };

    return () => {
    };
  }, [roomId]);

  if (!connected || !socketRef.current) return <div>Connecting to server...</div>;

  return <Canvas roomId={roomId} socket={socketRef.current} />;
}

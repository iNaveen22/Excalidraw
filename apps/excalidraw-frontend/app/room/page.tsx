"use client";
import { useState } from "react";
import { createRoom } from "../src/lib/room";
import { useRouter } from "next/navigation";
import { Users } from 'lucide-react';


export default function Home() {

  const [createName, setCreateName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const router = useRouter();

  async function handleCreate() {
    if (!createName.trim()) {
      alert("Please Enter Room Name");
      return;
    }
    try {
      const roomId = await createRoom(createName.trim());
      console.log('hereeeee', roomId);
      router.push(`/canvas/${roomId}`);
    } catch (err) {
      console.log("whyyyyyy", err);
      alert("Failed to create room");
    }
  }

  async function handleJoin() {
    if (!joinRoomId.trim()) {
      alert("Please enter a valid Room Id");
      return;
    }

    try {
      router.push(`/canvas/${joinRoomId.trim()}`);
    } catch (err) {
      console.error("Join room failed:", err);
      alert("Failed to join room");
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 bg-[size:20px_20px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-3xl mb-6">
          <Users className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Room
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Create collaborative spaces, invite your team, and work together in real-time
        </p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <input
            type="text"
            id="room_name"
            placeholder='Room name'
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
            required
          />
          <button
            onClick={handleCreate}
            className="rounded h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Room
          </button>
        </div>
        <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">OR</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <input
              type="text"
              id="room_id"
              placeholder='Room Id'
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
              required
            />
          <button
            onClick={handleJoin}
            className="rounded h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Join Room
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Quick Setup</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Create a room in seconds with a unique code</p>
          </div>

          <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Easy Sharing</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Share your room code and invite anyone</p>
          </div>

          <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Real-time</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">See participants join and interact instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}

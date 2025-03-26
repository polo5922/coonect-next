"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const joinRoom = () => {
    if (roomId && playerName) {
      router.push(`/room/${roomId}?playerName=${playerName}`);
    }
  };

  const createRoom = () => {
    if (playerName) {
      const randomRoomId = Math.random().toString(36).substring(2, 10);
      router.push(`/room/${randomRoomId}?playerName=${playerName}`);
    } else {
      alert("Veuillez saisir un nom de joueur avant de créer une room.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to Coonect Game
      </h1>
      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <input
          type="text"
          placeholder="Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <button
          onClick={joinRoom}
          className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
        >
          Join Room
        </button>
        <button
          onClick={createRoom}
          className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
        >
          Create Room
        </button>
      </div>
    </div>
  );
}

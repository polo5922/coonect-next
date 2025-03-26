// app/room/[id]/api/join/route.js

import { rooms } from "@/app/lib/rooms";

export async function POST(request, { params }) {
  const paramsData = await params;
  const roomId = paramsData.id;
  console.log(roomId);
  const body = await request.json();
  const { playerName } = body;

  if (!rooms[roomId]) {
    rooms[roomId] = { players: [], events: [] };
  }

  rooms[roomId].players.push(playerName);
  rooms[roomId].events.push({ type: "playerJoined", playerName });

  console.log(rooms);

  return Response.json({
    message: `Player ${playerName} joined room ${roomId}`,
  });
}

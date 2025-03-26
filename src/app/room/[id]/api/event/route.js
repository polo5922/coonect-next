// app/room/[id]/api/event/route.js

import { rooms } from "@/app/lib/rooms";

function encodeSSE(data) {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request) {
  const url = new URL(request.url);
  const roomId = url.pathname.split("/")[2];

  if (!rooms[roomId]) {
    return new Response(JSON.stringify({ message: "Room not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Envoyer les événements déjà présents
      rooms[roomId].events.forEach((event) => {
        controller.enqueue(encodeSSE(event));
      });

      // Envoyer de nouveaux événements régulièrement
      const interval = setInterval(() => {
        if (rooms[roomId].events.length > 0) {
          const event = rooms[roomId].events.shift();
          controller.enqueue(encodeSSE(event));
        }
      }, 1000);

      // Stopper l’intervalle quand la connexion se ferme
      controller._interval = interval;
    },
    cancel() {
      clearInterval(this._interval); // Nettoyage
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

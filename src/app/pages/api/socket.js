// pages/api/socket.js
import { Server } from "socket.io";

let rooms = {}; // Partagé entre les sockets

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔌 Initialisation du serveur Socket.IO");

    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
    });

    io.on("connection", (socket) => {
      console.log("🟢 Nouveau client connecté");

      // Le client veut rejoindre une room
      socket.on("joinRoom", ({ roomId, playerName }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
          rooms[roomId] = { players: [], events: [] };
        }

        rooms[roomId].players.push(playerName);
        const event = { type: "playerJoined", playerName };
        rooms[roomId].events.push(event);

        // Broadcast à tous les autres dans la room
        io.to(roomId).emit("event", event);

        console.log(`👥 ${playerName} a rejoint la room ${roomId}`);
      });

      // Le client peut envoyer un événement de jeu
      socket.on("gameEvent", ({ roomId, event }) => {
        if (rooms[roomId]) {
          rooms[roomId].events.push(event);
          io.to(roomId).emit("event", event);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client déconnecté");
        // (optionnel) nettoyage des rooms
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}

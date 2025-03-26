import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import GameServer from "./src/app/lib/gameServer.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const rooms = {};
app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("🟢 Nouveau client connecté");

    // Le client veut rejoindre une room

    socket.on("joinRoom", ({ roomId, playerName }) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = {
          game: new GameServer(10, 10, 10),
        };
      }

      const game = rooms[roomId].game;

      const player = game.addPlayer(playerName, socket.id);

      if (!player) {
        socket.emit("errorJoin", "Nom déjà utilisé");
        return;
      }

      const playerIndex = game.players.indexOf(player);
      socket.data.playerIndex = playerIndex;
      socket.data.roomId = roomId;

      socket.emit("playerIndex", playerIndex);
      io.to(roomId).emit("syncGame", game.getState());
    });

    socket.on("gameEvent", ({ roomId, event }) => {
      if (rooms[roomId]) {
        rooms[roomId].events.push(event);
        io.to(roomId).emit("event", event);
      }
    });

    socket.on("clickCell", ({ roomId, x, y }) => {
      const game = rooms[roomId]?.game;
      console.log("🖱️ Clic sur la cellule", x, y);
      if (!game) return;
      console.log("🎮 Joueur actuel", game.currentPlayer);
      console.log("🎮 Joueur socket", socket.data.playerIndex);

      if (socket.data.playerIndex !== game.currentPlayer) {
        // Pas le tour de ce joueur
        return;
      }

      game.handleClick(x, y);
      io.to(roomId).emit("syncGame", game.getState());
    });

    socket.on("startGame", ({ roomId }) => {
      const game = rooms[roomId]?.game;
      console.log("🚀 Début de la partie");
      if (!game) return;

      if (socket.data.playerIndex === 0 && game.gamestate === "init") {
        game.startGame();
        io.to(roomId).emit("syncGame", game.getState());
      }
    });

    socket.on("disconnect", () => {
      rooms[socket.data.roomId]?.game.removePlayer(socket.id);
      console.log("🔴 Client déconnecté");
      // (optionnel) nettoyage des rooms
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "@/app/socket";

import { use } from "react";
export default function RoomPage({ params }) {
  const { id: roomId } = use(params);
  const searchParams = useSearchParams();
  const playerName = searchParams.get("playerName");
  const canvasRef = useRef(null);

  const [grid, setGrid] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(null);

  useEffect(() => {
    console.log("player index and current player", playerIndex, currentPlayer);
  }, [playerIndex, currentPlayer]);

  useEffect(() => {
    socket.connect();

    socket.emit("joinRoom", { roomId, playerName });

    socket.on("syncGame", (gameState) => {
      console.log("🔄 Sync", gameState);
      setGrid(gameState.grid);
      setPlayers(gameState.players);
      setCurrentPlayer(gameState.currentPlayer);
    });

    socket.on("errorJoin", (message) => {
      alert(message);
    });

    socket.on("playerIndex", (index) => {
      console.log("🔢 Player index", index);
      setPlayerIndex(index);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerName]);

  // 💡 Click -> send coords to server
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      ((event.clientX - rect.left) / canvas.width) * grid.length
    );
    const y = Math.floor(
      ((event.clientY - rect.top) / canvas.height) * grid[0].length
    );
    socket.emit("clickCell", { roomId, x, y });
  };

  // 🧱 Affichage grille (très simple)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!grid.length) return;

    const cellWidth = canvas.width / grid.length;
    const cellHeight = canvas.height / grid[0].length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        ctx.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);

        const cell = grid[i][j];
        if (cell?.type === "circle") {
          ctx.fillStyle = cell.player.color;
          ctx.beginPath();
          ctx.arc(
            i * cellWidth + cellWidth / 2,
            j * cellHeight + cellHeight / 2,
            Math.min(cellWidth, cellHeight) / 4,
            0,
            2 * Math.PI
          );
          ctx.fill();
        } else if (cell?.type === "wall") {
          ctx.fillStyle = cell.player.color;
          ctx.fillRect(
            i * cellWidth + cellWidth / 4,
            j * cellHeight + cellHeight / 4,
            cellWidth / 2,
            cellHeight / 2
          );
        }
      }
    }

    // 🔗 Connexions entre cercles du même joueur
    const alreadyConnected = new Set();

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];

        if (cell?.type === "circle") {
          const neighbors = [
            [i - 1, j],
            [i + 1, j],
            [i, j - 1],
            [i, j + 1],
            [i - 1, j - 1],
            [i - 1, j + 1],
            [i + 1, j - 1],
            [i + 1, j + 1],
          ];

          neighbors.forEach(([x, y]) => {
            if (
              x >= 0 &&
              x < grid.length &&
              y >= 0 &&
              y < grid[0].length &&
              grid[x][y]?.type === "circle" &&
              grid[x][y].player.color === cell.player.color
            ) {
              const key = [i, j, x, y].join("-");
              const reverseKey = [x, y, i, j].join("-");
              if (
                !alreadyConnected.has(key) &&
                !alreadyConnected.has(reverseKey)
              ) {
                alreadyConnected.add(key);

                ctx.strokeStyle = cell.player.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(
                  i * cellWidth + cellWidth / 2,
                  j * cellHeight + cellHeight / 2
                );
                ctx.lineTo(
                  x * cellWidth + cellWidth / 2,
                  y * cellHeight + cellHeight / 2
                );
                ctx.stroke();
              }
            }
          });
        }
      }
    }
  }, [grid]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Room: {roomId}</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Players:</h2>
      {playerIndex === 0 && currentPlayer === null && (
        <button
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => socket.emit("startGame", { roomId })}
        >
          Lancer la partie
        </button>
      )}
      <ul className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mb-6">
        {players.map((player, index) => (
          <li
            key={index}
            className={`py-2 text-gray-800 border-b last:border-b-0 border-gray-200 ${
              index === currentPlayer ? "font-bold" : ""
            }`}
          >
            {player.name} - {player.score}
          </li>
        ))}
      </ul>
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={500}
        height={500}
        className="border border-black"
        onClick={handleCanvasClick}
      />
    </div>
  );
}

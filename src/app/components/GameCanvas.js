import React, { useEffect, useRef } from "react";

function GameCanvas({ game }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (game) {
      game.canva = canvasRef.current;
      game.drawGrid();
    }
  }, [game]);

  return (
    <canvas id="gameCanvas" ref={canvasRef} width={600} height={600}></canvas>
  );
}

export default GameCanvas;

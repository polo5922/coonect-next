class GameServer {
  constructor(gridX, gridY, scoreWin) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.score_win = scoreWin;
    this.players = []; // [{ name, color, score, socketId }]
    this.currentPlayer = null;
    this.grid = [];
    this.lastClickedCell = null;
    this.clickStep = "circle";
    this.gamestate = "init";
    this.generateGrid();
  }

  generateGrid() {
    this.grid = Array.from({ length: this.gridX }, () =>
      Array.from({ length: this.gridY }, () => ({ type: null, player: null }))
    );
  }

  removePlayer(socketId) {
    this.players = this.players.filter((p) => p.socketId !== socketId);
  }

  addPlayer(name, socketId) {
    if (this.players.find((p) => p.name === name)) {
      return null; // nom déjà utilisé
    }

    const colors = ["red", "blue", "green", "yellow"];
    let color = colors[Math.floor(Math.random() * colors.length)];
    while (this.players.find((p) => p.color === color)) {
      color = colors[Math.floor(Math.random() * colors.length)];
    }

    const player = { name, color, score: 0, socketId };
    this.players.push(player);
    return player;
  }

  startGame() {
    this.gamestate = "started";
    this.currentPlayer = 0;
  }

  handleClick(x, y) {
    console.log(this.gamestate, this.clickStep, x, y, this.grid[x][y]);
    if (this.gamestate !== "started") return;
    if (this.grid[x][y].type) return;

    if (this.clickStep === "circle") {
      this.placeCircle(x, y);
      this.clickStep = "wall";
    } else if (this.clickStep === "wall") {
      const success = this.placeWall(x, y);
      if (success) {
        this.clickStep = "circle";
        this.nextPlayer();
      }
    }
  }

  placeCircle(x, y) {
    this.grid[x][y] = {
      type: "circle",
      player: this.getCurrentPlayerPublicData(),
    };
    this.lastClickedCell = { x, y };
  }

  placeWall(x, y) {
    const dx = Math.abs(this.lastClickedCell.x - x);
    const dy = Math.abs(this.lastClickedCell.y - y);
    if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) return false;

    this.grid[x][y] = {
      type: "wall",
      player: this.getCurrentPlayerPublicData(),
    };

    this.updateScores();
    return true;
  }

  nextPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  updateScores() {
    this.players.forEach((player) => {
      player.score = 0;
      const positions = [];

      for (let x = 0; x < this.gridX; x++) {
        for (let y = 0; y < this.gridY; y++) {
          if (
            this.grid[x][y].type === "circle" &&
            this.grid[x][y].player.name === player.name
          ) {
            positions.push({ x, y });
          }
        }
      }

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = Math.abs(positions[i].x - positions[j].x);
          const dy = Math.abs(positions[i].y - positions[j].y);
          if (
            (dx === 1 && dy === 0) ||
            (dx === 0 && dy === 1) ||
            (dx === 1 && dy === 1)
          ) {
            player.score++;
          }
        }
      }
    });
  }

  getCurrentPlayerPublicData() {
    return this.players[this.currentPlayer];
  }

  getState() {
    return {
      grid: this.grid,
      players: this.players.map((p) => ({
        name: p.name,
        color: p.color,
        score: p.score,
      })),
      currentPlayer: this.currentPlayer,
      gamestate: this.gamestate,
    };
  }
}

export default GameServer;

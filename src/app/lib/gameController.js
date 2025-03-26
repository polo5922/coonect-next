import Player from "./player";
class game {
  constructor(canva, gridX, gridY, score_win) {
    this.canva = canva;
    this.gridX = gridX;
    this.gridY = gridY;
    this.players = [];
    this.currentPlayer = null;
    this.grid = [];
    this.onPlayerChange = null;
    this.onPlayerDataChange = null;
    this.pointerPosition = { x: null, y: null };
    this.clickStep = "circle";
    this.lastClickedCell = null;
    this.gamestate = "init";
    this.generateGrid();
    this.drawGrid();
    this.score_win = score_win;

    this.canva.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canva.addEventListener("click", this.handleClick.bind(this));
  }

  handleMouseMove(event) {
    const rect = this.canva.getBoundingClientRect();
    if (this.gamestate !== "started") {
      console.log("Game not started");
      return;
    }
    const x = Math.floor(
      ((event.clientX - rect.left) / this.canva.width) * this.gridX
    );
    const y = Math.floor(
      ((event.clientY - rect.top) / this.canva.height) * this.gridY
    );

    if (this.pointerPosition.x !== x || this.pointerPosition.y !== y) {
      //   console.log("Mouse moved", x, y);
      this.pointerPosition = { x, y };
      this.drawGrid(); // Redessinez la grille pour mettre à jour la surbrillance
    }
  }

  handleClick() {
    const { x, y } = this.pointerPosition;
    // console.log(this.clickStep);
    if (this.gamestate !== "started") {
      //   console.log("Game not started");
      return;
    }

    if (this.grid[x][y].type) {
      console.log("Cell already occupied");
      return;
    }

    if (this.clickStep === "circle") {
      // Place un cercle
      this.placeCircle(x, y);
      this.clickStep = "wall"; // Passe à l'étape suivante
    } else if (this.clickStep === "wall") {
      // Place un mur
      this.placeWall(x, y);
    }

    this.drawGrid(); // Redessinez la grille après chaque clic
  }

  setCurrentPlayer(player) {
    this.currentPlayer = player;

    if (this.onPlayerChange) {
      //   console.log("onPlayerChange", this.onPlayerChange);
      this.onPlayerChange(player);
    }
  }

  setPlayerData(data) {
    if (this.onPlayerDataChange) {
      this.onPlayerDataChange(this.players);
    }
  }

  addPlayer(name) {
    const colors = ["red", "blue", "green", "yellow"];

    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    while (this.players.find((player) => player.color === randomColor)) {
      randomColor = colors[Math.floor(Math.random() * colors.length)];
    }
    this.players.push(new Player(name, randomColor));
    this.setPlayerData(this.players);
  }

  startGame() {
    console.log("Game started");
    this.setCurrentPlayer(this.players[0]);
    this.gamestate = "started";
    console.log(this.currentPlayer);
  }

  endGame() {
    this.gamestate = "ended";
    this.checkWin();
    let win_player = this.players.find((player) => player.win === true);
    if (win_player) {
      alert(`Game ended ! ${win_player.name} wins !`);
    } else {
      alert("Game ended !");
    }

    console.log("Game ended");
  }

  generateGrid() {
    for (let i = 0; i < this.gridX; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridY; j++) {
        this.grid[i][j] = { type: null, player: null };
      }
    }
  }

  placeCircle(x, y) {
    console.log("Placing circle", x, y);
    // console.log(this.grid);
    this.grid[x][y].type = "circle";
    this.grid[x][y].player = this.currentPlayer;
    this.lastClickedCell = { x, y };
  }

  placeWall(x, y) {
    const distanceX = Math.abs(this.lastClickedCell.x - x);
    const distanceY = Math.abs(this.lastClickedCell.y - y);

    if (
      distanceX > 1 ||
      distanceY > 1 ||
      (distanceX === 0 && distanceY === 0)
    ) {
      console.log("Wall must be placed within 1 cell of the last circle.");
      this.clickStep = "wall";
      return;
    }

    this.grid[x][y].type = "wall";
    this.grid[x][y].player = this.currentPlayer;
    this.drawConnections();
    this.displayScores();

    this.clickStep = "circle";

    //set the current player to the next player
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    if (currentPlayerIndex === this.players.length - 1) {
      this.setCurrentPlayer(this.players[0]);
    } else {
      this.setCurrentPlayer(this.players[currentPlayerIndex + 1]);
    }
  }

  displayScores() {
    this.players.forEach((player) => {
      console.log(`${player.name}'s score: ${player.score}`);
    });
  }

  drawConnections() {
    const ctx = this.canva.getContext("2d");
    const cellWidth = this.canva.width / this.gridX;
    const cellHeight = this.canva.height / this.gridY;

    // Parcourez tous les joueurs
    this.players.forEach((player) => {
      const playerCircles = [];

      // Trouvez toutes les positions des cercles appartenant au joueur
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          if (
            this.grid[i][j].type === "circle" &&
            this.grid[i][j].player === player
          ) {
            playerCircles.push({ x: i, y: j });
          }
        }
      }

      let connections = 0; // Compteur de connexions pour ce joueur

      // Tracez des lignes entre les cercles à une distance de 1
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;

      for (let k = 0; k < playerCircles.length; k++) {
        for (let l = k + 1; l < playerCircles.length; l++) {
          const circle1 = playerCircles[k];
          const circle2 = playerCircles[l];

          // Vérifiez si les cercles sont à une distance de 1
          const distanceX = Math.abs(circle1.x - circle2.x);
          const distanceY = Math.abs(circle1.y - circle2.y);

          if (
            (distanceX === 1 && distanceY === 0) ||
            (distanceX === 0 && distanceY === 1) ||
            (distanceX === 1 && distanceY === 1)
          ) {
            // Tracez une ligne entre les cercles
            ctx.beginPath();
            ctx.moveTo(
              circle1.x * cellWidth + cellWidth / 2,
              circle1.y * cellHeight + cellHeight / 2
            );
            ctx.lineTo(
              circle2.x * cellWidth + cellWidth / 2,
              circle2.y * cellHeight + cellHeight / 2
            );
            ctx.stroke();

            connections++; // Incrémentez le compteur de connexions
          }
        }
      }

      // Mettez à jour le score du joueur avec le nombre de connexions
      player.score = connections;
    });

    // Mettez à jour les données des joueurs
    this.setPlayerData(this.players);
  }

  drawGrid() {
    const ctx = this.canva.getContext("2d");
    const cellWidth = this.canva.width / this.gridX;
    const cellHeight = this.canva.height / this.gridY;

    ctx.clearRect(0, 0, this.canva.width, this.canva.height); // Efface le canvas
    ctx.strokeStyle = "white";

    for (let i = 0; i < this.gridX; i++) {
      for (let j = 0; j < this.gridY; j++) {
        // Dessinez la grille
        ctx.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);

        // Dessinez les cercles ou les murs
        if (this.grid[i][j]) {
          if (this.grid[i][j].type === "circle") {
            ctx.fillStyle = this.grid[i][j].player.color;
            ctx.beginPath();
            ctx.arc(
              i * cellWidth + cellWidth / 2,
              j * cellHeight + cellHeight / 2,
              Math.min(cellWidth, cellHeight) / 4,
              0,
              2 * Math.PI
            );
            ctx.fill();
          } else if (this.grid[i][j].type === "wall") {
            ctx.fillStyle = this.grid[i][j].player.color;
            // dessine des rayures

            ctx.fillRect(
              i * cellWidth + cellWidth / 4,
              j * cellHeight + cellHeight / 4,
              cellWidth / 2,
              cellHeight / 2
            );
          }
        }
      }
    }

    // Mettez en surbrillance la case sous le pointeur
    if (this.pointerPosition.x !== null && this.pointerPosition.y !== null) {
      if (this.lastClickedCell && this.clickStep === "wall") {
        const distanceX = Math.abs(
          this.lastClickedCell.x - this.pointerPosition.x
        );
        const distanceY = Math.abs(
          this.lastClickedCell.y - this.pointerPosition.y
        );

        // console.log("Distance", distanceX, distanceY, this.clickStep);

        if (this.clickStep === "wall" && distanceX <= 1 && distanceY <= 1) {
          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            this.pointerPosition.x * cellWidth,
            this.pointerPosition.y * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      } else {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          this.pointerPosition.x * cellWidth,
          this.pointerPosition.y * cellHeight,
          cellWidth,
          cellHeight
        );
      }
    }
    this.drawConnections();
    if (this.gamestate === "started") {
      this.detectEndGame();
    }
  }

  drawConnections() {
    const ctx = this.canva.getContext("2d");
    const cellWidth = this.canva.width / this.gridX;
    const cellHeight = this.canva.height / this.gridY;

    // Parcourez tous les joueurs
    this.players.forEach((player) => {
      const playerCircles = [];

      // Trouvez toutes les positions des cercles appartenant au joueur
      for (let i = 0; i < this.gridX; i++) {
        for (let j = 0; j < this.gridY; j++) {
          if (
            this.grid[i][j].type === "circle" &&
            this.grid[i][j].player === player
          ) {
            playerCircles.push({ x: i, y: j });
          }
        }
      }

      let connections = 0; // Compteur de connexions pour ce joueur

      // Tracez des lignes entre les cercles à une distance de 1
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;

      for (let k = 0; k < playerCircles.length; k++) {
        for (let l = k + 1; l < playerCircles.length; l++) {
          const circle1 = playerCircles[k];
          const circle2 = playerCircles[l];

          // Vérifiez si les cercles sont à une distance de 1
          const distanceX = Math.abs(circle1.x - circle2.x);
          const distanceY = Math.abs(circle1.y - circle2.y);

          if (
            (distanceX === 1 && distanceY === 0) ||
            (distanceX === 0 && distanceY === 1) ||
            (distanceX === 1 && distanceY === 1)
          ) {
            // Tracez une ligne entre les cercles
            ctx.beginPath();
            ctx.moveTo(
              circle1.x * cellWidth + cellWidth / 2,
              circle1.y * cellHeight + cellHeight / 2
            );
            ctx.lineTo(
              circle2.x * cellWidth + cellWidth / 2,
              circle2.y * cellHeight + cellHeight / 2
            );
            ctx.stroke();

            connections++; // Incrémentez le compteur de connexions
          }
        }
      }

      // Mettez à jour le score du joueur avec le nombre de connexions
      player.score = connections;
    });

    // Mettez à jour les données des joueurs
    this.setPlayerData(this.players);
  }

  detectEndGame() {
    //detect if all cells are occupied or if all remaining cells have no cells around them
    let allCellsOccupied = true;
    let noMoreMoves = true;

    for (let i = 0; i < this.gridX; i++) {
      for (let j = 0; j < this.gridY; j++) {
        if (this.grid[i][j].type === null) {
          allCellsOccupied = false;
        }
      }
    }

    if (allCellsOccupied) {
      alert("All cells occupied");
      this.endGame();
    }

    //check if all cells with type null have all cells around them with type different than null
    for (let i = 0; i < this.gridX; i++) {
      for (let j = 0; j < this.gridY; j++) {
        if (this.grid[i][j].type === null) {
          if (
            (i > 0 && this.grid[i - 1][j].type === null) ||
            (i < this.gridX - 1 && this.grid[i + 1][j].type === null) ||
            (j > 0 && this.grid[i][j - 1].type === null) ||
            (j < this.gridY - 1 && this.grid[i][j + 1].type === null)
          ) {
            noMoreMoves = false;
          }
        }
      }
    }

    if (noMoreMoves) {
      alert("No more moves");
      this.endGame();
    }
  }

  checkWin() {
    const winner = this.players.find(
      (player) => player.score >= this.score_win
    );
    if (winner) {
      winner.win = true;
      this.setPlayerData(this.players);
      console.log(`Player ${winner.name} wins!`);
      this.endGame();
    } else {
      let players_sort = this.players.sort((a, b) => b.score - a.score);
      this.setPlayerData(this.players);
      players_sort[0].win = true;
      this.endGame();
    }
  }
}

export default game;

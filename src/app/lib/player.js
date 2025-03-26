class Player {
  constructor(name, color) {
    this.name = name;
    this.score = 0;
    this.color = color;
    this.colorHex = this.getColorHex();
    console.log("Player created", this.name);
  }

  increaseScore() {
    this.score++;
  }

  getColorHex() {
    switch (this.color) {
      case "red":
        return "#FF0000";
      case "blue":
        return "#0000FF";
      case "green":
        return "#00FF00";
      case "yellow":
        return "#FFFF00";
      default:
        return "#000000";
    }
  }

  setScore(score) {
    this.score = score;
  }
}

export default Player;

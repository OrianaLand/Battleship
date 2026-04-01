import { Ship } from "./ship";
import { Player } from "./player";

export class Game {
  constructor() {
    this.human = new Player("human");
    this.cpu = new Player("cpu");
    this.currentTurn = "human";
    this.state = "setup"; // "setup" | "playing" | "over"
    this.winner = null;
  }

  // --- Setup phase ---
  placeHumanShip(ship, row, col, orientation) {
    if (this.state !== "setup") throw new Error("Game already started");
    return this.human.gameboard.placeShip(ship, row, col, orientation);
  }
}

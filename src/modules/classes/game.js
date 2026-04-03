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

  placeCPUShipsRandomly() {
    const shipLengths = [5, 4, 3, 3, 2];

    for (const lenght of shipLengths) {
      const ship = new Ship(lenght);
      let placed = false;

      while (!placed) {
        const row = Math.floor(Math.random() * this.cpu.gameboard.size);
        const col = Math.floor(Math.random() * this.cpu.gameboard.size);
        const orientation = Math.random() < 0.5 ? "H" : "V";
        placed = this.cpu.gameboard.placeShip(ship, row, col, orientation);
      }
    }
  }
}

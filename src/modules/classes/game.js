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

  startGame() {
    if (this.state !== "setup") throw new Error("Game already started");
    this.placeCPUShipsRandomly();
    this.state = "playing";
  }

  // --- Playing phase ---
  humanAttack(row, col) {
    if (this.state !== "playing") throw new Error("Game is not in progress");
    if (this.currentTurn !== "human") throw new Error("Not your turn");

    const result = this.human.attack(this.cpu.gameboard, row, col);
    this.#checkForWinner();

    if (this.state === "playing") this.currentTurn = "cpu";
    return result;
  }

  cpuAttack() {
    if (this.state !== "playing") throw new Error("Game is not in progress");
    if (this.currentTurn !== "cpu") throw new Error("Not CPU's turn");

    const result = this.cpu.randomAttack(this.human.gameboard);
    this.#checkForWinner();

    if (this.state === "playing") this.currentTurn = "human";
    return result;
  }

  #checkForWinner() {
    {
      if (this.cpu.gameboard.allShipsSunk()) {
        this.state = "over";
        this.winner = "human";
      } else if (this.human.gameboard.allShipsSunk()) {
        this.state = "over";
        this.winner = "cpu";
      }
    }
  }

  // --- Utility ---

  getState() {
    return {
      state: this.state,
      currentTurn: this.currentTurn,
      winner: this.winner,
      humanBoard: this.human.gameboard.grid,
      cpuBoard: this.cpu.gameboard.grid,
    };
  }
}

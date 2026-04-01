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
}

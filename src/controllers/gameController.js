import { createBoardGrid, updateCell } from "../dom/renderBoard";
import { Game } from "../modules/classes/game";
import { Ship } from "../modules/classes/ship";
export class GameController {
  constructor() {
    this.game = new Game();
    this.humanGrid = null;
    this.cpuGrid = null;
    this.views = [];
  }

  // initialize
  init() {
    this.game.placeHumanShip(new Ship(5), 0, 0, "H");
    this.game.placeHumanShip(new Ship(4), 2, 0, "V");
    this.game.placeHumanShip(new Ship(3), 4, 5, "V");
    this.game.placeHumanShip(new Ship(3), 8, 2, "H");
    this.game.placeHumanShip(new Ship(2), 2, 8, "H");

    this.game.startGame();

    const humanContainer = document.querySelector("#human-board");
    const cpuContainer = document.querySelector("#cpu-board");

    this.humanGrid = createBoardGrid(this.game.human.gameboard, humanContainer);
    this.cpuGrid = createBoardGrid(this.game.cpu.gameboard, cpuContainer);
  }

  //handle human attack on cpu grid
}

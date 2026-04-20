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

    this.#attachCPUBoardListener();
  }

  //handle human attack on cpu grid
  #attachCPUBoardListener() {
    this.cpuGrid.addEventListener("click", (e) => {
      const cell = e.target.closest(".cell");

      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      this.#handleHumanAttack(row, col);
    });
  }

  #handleHumanAttack(row, col) {
    if (this.game.state !== "playing" || this.game.currentTurn !== "human")
      return;

    try {
      const result = this.game.humanAttack(row, col);
      updateCell(this.cpuGrid, this.game.cpu.gameboard, row, col, true);
      console.log(`Human attacked (${row}, ${col}): ${result}`);
      console.log(`Current turn: ${this.game.currentTurn}`);
    } catch (e) {
      console.warn(e.message); // already attacked this cell
    }
  }
}

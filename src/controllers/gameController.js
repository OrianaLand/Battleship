import { createBoardGrid, updateCell } from "../dom/renderBoard";
import { Game } from "../modules/classes/game";
import { Ship } from "../modules/classes/ship";
import { StatusView } from "../views/statusView";
import { GameBoardView } from "../views/GameBoardView";
export class GameController {
  #cpuThinking = false;
  constructor() {
    this.game = new Game();
    this.views = [];
    this.message = new StatusView(document.querySelector("#message"));
    this.currentTurn = new StatusView(document.querySelector("#current-turn"));
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

    this.humanBoardView = new GameBoardView(humanContainer);
    this.cpuBoardView = new GameBoardView(cpuContainer, true, (row, col) => {
      this.#handleHumanAttack(row, col);
    });

    this.humanBoardView.render(this.game.human.gameboard);
    this.cpuBoardView.render(this.game.cpu.gameboard);
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
      this.cpuBoardView.update(row, col);
      console.log(`Human attacked (${row}, ${col}): ${result}`);
      console.log(`Current turn: ${this.game.currentTurn}`);

      this.message.update(`Human attacked (${row}, ${col}): ${result}`);
      this.currentTurn.update(`Current turn: ${this.game.currentTurn}`);

      if (result === "miss" && this.game.state === "playing") {
        this.#cpuThinking = true;
        this.#handleCpuAttack().finally(() => {
          this.#cpuThinking = false;
        });
      }

      if (this.game.state === "over") {
        console.log(`Game over! Winner: ${this.game.winner}`);

        this.message.update(`Game over! ${this.game.winner} wins!`);
        this.currentTurn.clear();
      }
    } catch (e) {
      console.warn(e.message); // already attacked this cell
    }
  }

  async #handleCpuAttack() {
    if (this.game.state !== "playing") return;

    await this.#sleep(1500);

    const { row, col, result } = this.game.cpuAttack();
    this.humanBoardView.update(row, col);
    console.log(`CPU attacked (${row}, ${col}): ${result}`);
    console.log(`Current turn: ${this.game.currentTurn}`);

    this.message.update(`CPU attacked (${row}, ${col}): ${result}`);
    this.currentTurn.update(`Current turn: ${this.game.currentTurn}`);

    if (this.game.state === "over") {
      console.log(`Game over! Winner: ${this.game.winner}`);

      this.message.update(`Game over! ${this.game.winner} wins!`);
      this.currentTurn.clear();
    }

    if (result === "hit") {
      await this.#handleCpuAttack(); // CPU gets another turn
    }
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

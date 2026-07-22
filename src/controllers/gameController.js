import { createBoardGrid, updateCell } from "../dom/renderBoard";
import { Game } from "../modules/classes/game";
import { Ship } from "../modules/classes/ship";
import { StatusView } from "../views/statusView";
import { GameBoardView } from "../views/GameBoardView";
import { GameView } from "../views/gameView";

export class GameController {
  #cpuThinking = false;
  constructor() {
    this.game = new Game();
    this.gameView = new GameView((row, col) =>
      this.#handleHumanAttack(row, col),
    );
  }

  // initialize
  init() {
    this.#setupPhase();
    console.log("called init???");
  }

  #setupPhase() {
    this.game.placeHumanShip(new Ship(5), 0, 0, "H");
    this.game.placeHumanShip(new Ship(4), 2, 0, "V");
    this.game.placeHumanShip(new Ship(3), 4, 5, "V");
    this.game.placeHumanShip(new Ship(3), 8, 2, "H");
    this.game.placeHumanShip(new Ship(2), 2, 8, "H");

    this.#startGame();
    console.log("called setupPhase");
  }

  #startGame() {
    console.log("called startgame");
    this.game.startGame();
    this.#initViews();
  }

  #initViews() {
    this.gameView.renderBoards(
      this.game.human.gameboard,
      this.game.cpu.gameboard,
    );
    console.log("called gameView");
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
    if (this.#cpuThinking) return;

    try {
      const result = this.game.humanAttack(row, col);
      this.gameView.updateCpuBoard(row, col);
      this.gameView.setMessage(`You attacked (${row}, ${col}): ${result}`);
      this.gameView.setTurn(`Current turn: ${this.game.currentTurn}`);
      console.log(`Human attacked (${row}, ${col}): ${result}`);
      console.log(`Current turn: ${this.game.currentTurn}`);

      if (this.game.state === "over") {
        console.log(`Game over! Winner: ${this.game.winner}`);
        this.gameView.showGameOver(this.game.winner);
        return;
      }

      if (result === "miss" && this.game.state === "playing") {
        this.#cpuThinking = true;
        this.#handleCpuAttack().finally(() => {
          this.#cpuThinking = false;
        });
      }
    } catch (e) {
      console.warn(e.message);
    }
  }

  async #handleCpuAttack() {
    if (this.game.state !== "playing") return;

    await this.#sleep(1500);

    const { row, col, result } = this.game.cpuAttack();
    this.gameView.updateHumanBoard(row, col);
    this.gameView.setMessage(`CPU attacked (${row}, ${col}): ${result}`);
    this.gameView.setTurn(`Current turn: ${this.game.currentTurn}`);

    console.log(`CPU attacked (${row}, ${col}): ${result}`);
    console.log(`Current turn: ${this.game.currentTurn}`);

    if (this.game.state === "over") {
      console.log(`Game over! Winner: ${this.game.winner}`);

      this.gameView.showGameOver(this.game.winner);
      return;
    }

    if (result === "hit") {
      await this.#handleCpuAttack(); // CPU gets another turn
    }
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

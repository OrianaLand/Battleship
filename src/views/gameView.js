import { GameBoardView } from "./GameBoardView";
import { StatusView } from "./statusView";

export class GameView {
  constructor(onCellClick) {
    this.humanBoardView = new GameBoardView(
      document.querySelector("#human-board"),
    );
    this.cpuBoardView = new GameBoardView(
      document.querySelector("#cpu-board"),
      true,
      onCellClick,
    );
    this.message = new StatusView(document.querySelector("#message"));
    this.currentTurn = new StatusView(document.querySelector("#current-turn"));
  }

  renderBoards(humanBoard, cpuBoard) {
    this.humanBoardView.render(humanBoard);
    this.cpuBoardView.render(cpuBoard);
  }

  updateHumanBoard(row, col) {
    this.humanBoardView.update(row, col);
  }

  updateCpuBoard(row, col) {
    this.cpuBoardView.update(row, col);
  }

  setMessage(text) {
    this.message.update(text);
  }

  setTurn(text) {
    this.currentTurn.update(text);
  }

  showGameOver(winner) {
    this.message.update("Game over! ${winner} wins!");
    this.currentTurn.clear();
  }
}

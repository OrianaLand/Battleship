import { createBoardGrid, updateCell } from "../dom/renderBoard";

export class GameBoardView {
  #grid = null;
  #hideShips;
  #onCellClick;

  constructor(container, hideShips = false, onCellClick = null) {
    this.container = container;
    this.#hideShips = hideShips;
    this.#onCellClick = onCellClick;
  }

  render(board) {
    this.board = board;
    this.#grid = createBoardGrid(board, this.container, this.#hideShips);

    if (this.#onCellClick) {
      this.#grid.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell");
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        this.#onCellClick(row, col);
      });
    }
  }

  update(row, col) {
    updateCell(this.#grid, this.board, row, col, this.#hideShips);
  }
}

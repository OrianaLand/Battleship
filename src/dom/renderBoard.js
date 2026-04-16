export function createBoardGrid(board, hideShips = false) {
  const grid = document.createElement("div");

  grid.className = "grid";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell =
        document.createElement(
          "div",
        ); /* createCell(row, col, board, hideShips) */
      grid.appendChild(cell);
    }
  }
  document.body.appendChild(grid);
}

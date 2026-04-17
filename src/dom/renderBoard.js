export function createBoardGrid(board, container, hiddenShhips = false) {
  const grid = document.createElement("div");

  grid.className = "grid";
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cell = createCell(row, col, board, hiddenShhips);
      grid.appendChild(cell);
    }
  }
  container.appendChild(grid);
  return grid;
}

function createCell(row, col, board, hiddenShhips) {
  const cell = document.createElement("div");

  cell.className = "cell";
  cell.dataset.row = row;
  cell.dataset.col = col;

  const cellData = board.grid[row][col]; // ship object or null cell
  const hasShip = cellData !== null;
  const isHit = board.hitAttacks.some(([r, c]) => r === row && c === col);
  const isMiss = board.missedAttacks.some(([r, c]) => r === row && c === col);

  if (hasShip && !hideShips) cell.classList.add("ship");
  if (isHit) cell.classList.add("hit");
  if (isMiss) cell.classList.add("miss");

  return cell;
}

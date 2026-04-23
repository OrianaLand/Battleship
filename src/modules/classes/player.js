import { Gameboard } from "./gameboard";
export class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard();
    this.attacks = [];
    this.mode = "hunt"; // Hunt/Target state for Computer player
    this.targetQueue = []; // Adjacent pending cells to try in target mode
  }

  attack(opponentGameboard, row, col) {
    // check if already attacked here
    if (this.attacks.some(([r, c]) => r === row && c === col)) {
      throw new Error("Already atttacked this position");
    }

    const result = opponentGameboard.receiveAttack(row, col);
    this.attacks.push([row, col]);
    return result;
  }

  randomAttack(opponentGameboard) {
    let row, col;

    if (this.mode === "target" && this.targetQueue.length > 0) {
      // Pop the next promising cell
      [row, col] = this.targetQueue.shift();

      // Skip if already attacked
      if (this.attacks.some(([r, c]) => r === row && c === col)) {
        return this.randomAttack(opponentGameboard); // try next in queue
      }
    } else {
      // Hunt mode: pick a random unattacked cell
      this.mode = "hunt";
      do {
        row = Math.floor(Math.random() * opponentGameboard.size);
        col = Math.floor(Math.random() * opponentGameboard.size);
      } while (this.attacks.some(([r, c]) => r === row && c === col));
    }

    const result = this.attack(opponentGameboard, row, col);

    if (result === "hit") {
      this.mode = "target";
      this.#addAdjacentCells(row, col, opponentGameboard.size);
    }

    const attackedShip = opponentGameboard.grid[row][col];

    if (attackedShip && attackedShip.isSunk()) {
      this.mode = "hunt";
      this.targetQueue = []; // clear remaining neighbors, ship is already sunk
    }

    if (opponentGameboard.allShipsSunk()) {
      this.mode = "hunt"; // reset just in case
    }

    return { row, col, result };
  }

  #addAdjacentCells(row, col, size) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    for (const [r, c] of neighbors) {
      if (
        r >= 0 &&
        r < size &&
        c >= 0 &&
        c < size &&
        !this.attacks.some(([ar, ac]) => ar === r && ac === c) &&
        !this.targetQueue.some(([qr, qc]) => qr === r && qc === c)
      ) {
        this.targetQueue.push([r, c]);
      }
    }
  }
}

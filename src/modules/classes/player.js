import { Gameboard } from "./gameboard";
export class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard();
    this.attacks = [];
    this.difficulty = "admiral"; // sailor(random/easy) | captain(uses hunt-target) | admiral(oriantation-aware)
    this.mode = "hunt"; // Hunt/Target state for Computer player
    this.targetQueue = []; // Adjacent pending cells to try in target mode
    this.lastHit = null; // first hit on a ship
    this.lockedAxis = null; // "H" or "V" once orientation is known
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

      if (
        this.difficulty === "admiral" &&
        this.lastHit &&
        this.lockedAxis === null
      ) {
        // Second hit — now lock the axis
        const [lr, lc] = this.lastHit;
        this.lockedAxis = row === lr ? "H" : "V";
        this.targetQueue = [];
        this.#addAxisCells(row, col, opponentGameboard.size);
        this.#addAxisCells(lr, lc, opponentGameboard.size);
      } else {
        this.#onHit(row, col, opponentGameboard.size);
      }

      // Always update lastHit to the most recent hit
      if (this.difficulty === "admiral" && !this.lastHit) {
        this.lastHit = [row, col];
      }
    }

    const attackedShip = opponentGameboard.grid[row][col];

    if (attackedShip && attackedShip.isSunk()) {
      this.#resetTargeting(); // clears mode, queue, lastHit and lockedAxis
    }

    if (opponentGameboard.allShipsSunk()) {
      this.#resetTargeting(); // reset just in case
    }

    return { row, col, result };
  }

  #onHit(row, col, size) {
    if (this.difficulty === "sailor") return; // pure random, do nothing

    if (this.difficulty === "admiral" && this.lockedAxis !== null) {
      // Axis already locked — only extend along it
      this.#addAxisCells(row, col, size);
      return;
    }

    this.#addAdjacentCells(row, col, size); // First hit (no axis yet) — add all 4 neighbors
  }

  #addAxisCells(row, col, size) {
    const neighbors =
      this.lockedAxis === "H"
        ? [
            [row, col - 1],
            [row, col + 1],
          ]
        : [
            [row - 1, col],
            [row + 1, col],
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

  #resetTargeting() {
    this.mode = "hunt";
    this.targetQueue = [];
    this.lastHit = null;
    this.lockedAxis = null;
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

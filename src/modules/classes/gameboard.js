import { Ship } from "./ship";

export class Gameboard {
  constructor(size = 10) {
    this.size = size;
    this.grid = Array(size)
      .fill()
      .map(() => Array(size).fill(null));
    this.ships = [];
    this.missedAttacks = [];
    this.hitAttacks = [];
  }

  placeShip(ship, row, col, orientation) {
    //Check if placemente is valid
    if (!this.isValidPlacement(ship, row, col, orientation)) {
      return false;
    }

    //Place the ship
    for (let i = 0; i < ship.getLength(); i++) {
      if (orientation === "H") {
        this.grid[row][col + i] = ship;
      } else {
        this.grid[row + i][col] = ship;
      }
    }

    this.ships.push(ship);
    return true;
  }

  isValidPlacement(ship, row, col, orientation) {
    if (orientation !== "H" && orientation !== "V") return false; // Check if orientation is valid
    if (row < 0 || col < 0) return false; // Check for negative coordinates

    for (let i = 0; i < ship.getLength(); i++) {
      let checkRow = orientation === "H" ? row : row + i;
      let checkCol = orientation === "H" ? col + i : col;

      if (checkRow >= this.size || checkCol >= this.size) return false; // Check bounds
      if (this.grid[checkRow][checkCol] !== null) return false; // Check if cell is already occupied
    }
    return !this.#hasAdjacentShip(ship, row, col, orientation);
  }

  #hasAdjacentShip(ship, row, col, orientation) {
    const cells = [];

    for (let i = 0; i < ship.getLength(); i++) {
      const r = orientation === "H" ? row : row + i;
      const c = orientation === "H" ? col + i : col;
      cells.push([r, c]);
    }

    for (const [r, c] of cells) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;

          if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) continue; // continue if out of bounds
          if (cells.some(([sr, sc]) => sr === nr && sc === nc)) continue; // skip own cells
          if (this.grid[nr][nc] !== null) return true; // if neighbor cell has a ship placement gets rejected
        }
      }
    }

    return false;
  }

  receiveAttack(row, col) {
    if (
      this.missedAttacks.some(([r, c]) => r === row && c === col) ||
      this.hitAttacks.some(([r, c]) => r === row && c === col)
    ) {
      throw new Error("Already attacked this postion");
    }

    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      throw new Error("Attack out of bounds");
    }

    if (this.grid[row][col] !== null) {
      // Hit a ship
      const ship = this.grid[row][col];
      ship.hit();
      this.hitAttacks.push([row, col]);
      return "hit";
    } else {
      // Miss a ship
      this.missedAttacks.push([row, col]);
      return "miss";
    }
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}

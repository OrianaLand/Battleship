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
    for (let i = 0; i < ship.length; i++) {
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

    for (let i = 0; i < ship.length; i++) {
      let checkRow = orientation === "H" ? row : row + i;
      let checkCol = orientation === "H" ? col + i : col;

      if (checkRow >= this.size || checkCol >= this.size) return false; // Check bounds
      if (this.grid[checkRow][checkCol] !== null) return false; // Check if cell is already occupied
    }
    return true;
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
    return this.ships.every((ship) => ship.isSunk());
  }
}

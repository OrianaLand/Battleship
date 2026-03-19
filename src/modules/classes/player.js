import { Gameboard } from "./gameboard";
export class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard();
    this.attacks = []; //Attacks on opponent's gameboard as Human
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
    let validAttack = false;

    while (!validAttack) {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);

      if (!this.attacks.some(([r, c]) => r === row && c === col)) {
        validAttack = true;
      }
    }

    const result = this.attack(opponentGameboard, row, col);
    return { row, col, result };
  }
}

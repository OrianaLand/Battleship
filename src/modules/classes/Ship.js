export class Ship {
  #hits;
  #length;
  constructor(length, name) {
    this.#length = length;
    this.#hits = 0;
    this.name = name;
  }

  hit() {
    if (!this.isSunk()) {
      this.#hits++;
    }
  }

  getHits() {
    return this.#hits;
  }

  getLength() {
    return this.#length;
  }

  isSunk() {
    return this.#hits === this.#length;
  }
}

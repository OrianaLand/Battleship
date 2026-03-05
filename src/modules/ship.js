export class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
  }

  hit() {
    if (this.length > this.hits) {
      this.hits++;
    } else {
      return this.hits === this.length;
    }
  }

  getHits() {
    return this.hits;
  }

  isSunk() {
    return this.hits === this.length;
  }
}

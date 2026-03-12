import { Ship } from "../classes/ship";

describe("Ship", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(4); // Create a fresh ship before each git test
  });

  test("Has a lenght property", () => {
    expect(ship.length).not.toBe(0);
  });

  test("hit() should increment hits by 1", () => {
    ship.hit();
    expect(ship.getHits()).toBe(1);
  });

  test("hit() should work multiple times", () => {
    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.getHits()).toBe(3);
  });

  test("hit() should not exceed lenght", () => {
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit(); //This 5th hit should not increment hits

    expect(ship.getHits()).toBe(4);
  });

  test("isSunk() calculates if a ship is sunk", () => {
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});

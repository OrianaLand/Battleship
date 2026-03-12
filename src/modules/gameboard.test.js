import { Gameboard } from "./gameboard";
import { Ship } from "./ship";
describe("Gameboard", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(); // Create a fresh gameboard before each git test
  });

  test("Gameboard should be a 10x10 grid", () => {
    expect(gameboard.grid.length).toBe(10);
    expect(gameboard.grid[0].length).toBe(10);
    expect(gameboard.grid[2].length).toBe(10);
    expect(gameboard.grid[4].length).toBe(10);
  });

  test("Places ship horizontally", () => {
    const ship = new Ship(3);
    const placed = gameboard.placeShip(ship, 2, 3, "H");

    expect(placed).toBe(true);

    expect(gameboard.grid[2][3]).toBe(ship);
    expect(gameboard.grid[2][4]).toBe(ship);
    expect(gameboard.grid[2][5]).toBe(ship);
  });

  test("Places ship vertically", () => {
    const ship = new Ship(4);
    const placed = gameboard.placeShip(ship, 2, 3, "V");

    expect(placed).toBe(true);

    expect(gameboard.grid[2][3]).toBe(ship);
    expect(gameboard.grid[3][3]).toBe(ship);
    expect(gameboard.grid[4][3]).toBe(ship);
  });

  test("should not place ship if cells are already occupied", () => {
    const ship1 = new Ship(3);
    const ship2 = new Ship(3);

    gameboard.placeShip(ship1, 2, 2, "H");
    const placed = gameboard.placeShip(ship2, 2, 3, "H"); // Overlaps

    expect(placed).toBe(false);
    // Original ship should still be there
    expect(gameboard.grid[2][2]).toBe(ship1);
    expect(gameboard.grid[2][3]).toBe(ship1);
    expect(gameboard.grid[2][4]).toBe(ship1);
  });

  test("Should receive attack and miss", () => {
    const result = gameboard.receiveAttack(5, 3);
    expect(result).toBe("miss");
  });

  test("Should not allow attacks on the same coordinates twice", () => {
    gameboard.receiveAttack(5, 3);
    expect(() => {
      gameboard.receiveAttack(5, 3);
    }).toThrow("Already attacked this postion");
  });

  test("should report if all ships are sunk", () => {
    const ship1 = new Ship(2);
    const ship2 = new Ship(2);

    gameboard.placeShip(ship1, 0, 0, "H");
    gameboard.placeShip(ship2, 5, 5, "H");

    expect(gameboard.allShipsSunk()).toBe(false);

    // Sink ship1
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 1);

    expect(gameboard.allShipsSunk()).toBe(false);

    // Sink ship2
    gameboard.receiveAttack(5, 5);
    gameboard.receiveAttack(5, 6);

    expect(gameboard.allShipsSunk()).toBe(true);
  });
});

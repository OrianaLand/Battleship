import { Player } from "../classes/player";
import { Ship } from "../classes/ship";
import { Gameboard } from "../classes/gameboard";

describe("Player", () => {
  let humanPlayer;
  let computerPlayer;
  let opponentGameboard;

  beforeEach(() => {
    humanPlayer = new Player("human"); // Create a new Player before each git test
    computerPlayer = new Player("computer"); // Create a new Player before each git test
    opponentGameboard = new Gameboard(); // Create a new Player before each git test);

    //Places a ship on opponent's board for attack tests
    const ship = new Ship(4);
    opponentGameboard.placeShip(ship, 2, 4, "V");
  });

  test("Should create a player with specified type", () => {
    expect(humanPlayer.type).toBe("human");
    expect(computerPlayer.type).toBe("computer");
  });

  test("Should create a player with their own gameboard", () => {
    expect(humanPlayer.gameboard).toBeInstanceOf(Gameboard);
    expect(computerPlayer.gameboard).toBeInstanceOf(Gameboard);
  });

  test("Human player should be able to attack opponent's gameboard", () => {
    const result = humanPlayer.attack(opponentGameboard, 3, 4);

    expect(result).toBe("hit");
  });

  test("Human player should be able record a miss when attacking an empty cell", () => {
    const result = humanPlayer.attack(opponentGameboard, 0, 0);

    expect(result).toBe("miss");
  });

  test("Computer player should make a random attack", () => {
    // Mock Math.random() to control the test
    const mockMath = jest.spyOn(Math, "random");

    // Tell the spy what results to return
    // First value for row, second for col
    mockMath.mockReturnValueOnce(0.1);
    mockMath.mockReturnValueOnce(0.4);

    const result = computerPlayer.randomAttack(opponentGameboard);

    expect(result.row).toBe(1);
    expect(result.col).toBe(4);

    expect(result.result).toBe("miss");

    //Puts Math.random() back to its normal behavior
    mockMath.mockRestore();
  });

  test("Computer should not attack the same coordinate twice", () => {
    const mockMath = jest.spyOn(Math, "random");

    // Mock to return 2,2 first (hit)
    mockMath.mockReturnValueOnce(0.2);
    mockMath.mockReturnValueOnce(0.2);

    let result = computerPlayer.randomAttack(opponentGameboard);

    expect(result.result).toBe("miss");

    // Mock to return 2,2 again (should be prevented by while loop)
    // Then lands on (5, 5) on the second iteration
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);

    result = computerPlayer.randomAttack(opponentGameboard);
    expect(result.result).toBe("miss");
    expect(result.row).toBe(5);
    expect(result.col).toBe(5);
    expect(computerPlayer.attacks).toHaveLength(2);
    expect(computerPlayer.attacks).toContainEqual([5, 5]);
    expect(computerPlayer.attacks).toEqual(
      expect.arrayContaining([
        [2, 2],
        [5, 5],
      ]),
    );
  });

  test("player should track their own attacks", () => {
    humanPlayer.attack(opponentGameboard, 1, 1);
    humanPlayer.attack(opponentGameboard, 2, 2);
    humanPlayer.attack(opponentGameboard, 3, 3);

    expect(humanPlayer.attacks.length).toBe(3);
    expect(humanPlayer.attacks).toContainEqual([1, 1]);
    expect(humanPlayer.attacks).toContainEqual([2, 2]);
    expect(humanPlayer.attacks).toContainEqual([3, 3]);
  });

  test("should not allow player to attack the same coordinates twice", () => {
    humanPlayer.attack(opponentGameboard, 3, 3);

    expect(() => {
      humanPlayer.attack(opponentGameboard, 3, 3);
    }).toThrow("Already atttacked this position");
  });
});

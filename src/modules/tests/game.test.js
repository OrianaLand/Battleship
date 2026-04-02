import { Game } from "../classes/game";
import { Player } from "../classes/player";
import { Ship } from "../classes/ship";

// Mock the randomAttack method to make CPU behavior predictable in tests
jest.mock("../classes/player", () => {
  const originalModule = jest.requireActual("../classes/player");
  return {
    ...originalModule,
    Player: jest.fn().mockImplementation((type) => {
      const instance = new originalModule.Player(type);
      // Spy on randomAttack to make it controllable in tests
      instance.randomAttack = jest.fn();
      return instance;
    }),
  };
});

describe("Game", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  describe("Constructor", () => {
    test("Should initialize with correct default values", () => {
      expect(game).toBeInstanceOf(Game);
      expect(game.human).toBeDefined(); //  instead of toBeInstanceOf(Player)
      expect(game.cpu).toBeDefined(); //  instead of toBeInstanceOf(Player)
      expect(game.currentTurn).toBe("human");
      expect(game.state).toBe("setup");
      expect(game.winner).toBeNull();
    });

    test("Should have human and cpu players with correct types", () => {
      expect(game.human.type).toBe("human"); // confirms that it's a Player
      expect(game.cpu.type).toBe("cpu");
    });

    test("Should have separate gamenoards for each player", () => {
      expect(game.human.gameboard).not.toBe(game.cpu.gameboard);
    });
  });

  describe("placeHumanShip", () => {
    test("Should place ship when game is in setup state", () => {
      const ship = new Ship(5);
      const result = game.placeHumanShip(ship, 0, 0, "H");

      expect(result).toBe(true);
      expect(game.human.gameboard.grid[0][0]).not.toBeNull();
    });

    test("Should throw error when game is not in setup state", () => {
      game.state = "playing";
      const ship = new Ship(5);

      expect(() => {
        game.placeHumanShip(ship, 0, 0, "V");
      }).toThrow("Game already started");
    });

    test("should return false for invalid placement", () => {
      const ship = new Ship(5);
      // Trying to place a 5-length ship at edge with horizontal orientation
      const result = game.placeHumanShip(ship, 0, 8, "H");

      expect(result).toBe(false);
    });

    test("should not place overlapping ships", () => {
      const ship1 = new Ship(3);
      const ship2 = new Ship(3);

      game.placeHumanShip(ship1, 0, 0, "H");
      const result = game.placeHumanShip(ship2, 0, 1, "H");

      expect(result).toBe(false);
    });
  });

  describe("placeCPUShipsRandomly", () => {
    test("Should place all 5 ships for CPU", () => {
      // Spy on placeShip to county calls
      const placeShipSpy = jest.spyOn(game.cpu.gameboard, "placeShip");

      game.placeCPUShipsRandomly();

      // Should attempt to place 5 ships
      expect(placeShipSpy).toHaveBeenCalledTimes(5);
      expect(game.cpu.gameboard.allShipsPlaced()).toBe(true);
    });

    test("should place ships of correct lenghts", () => {
      //Track ship lenghts placed
      const shipLengths = [];
      const originalPlaceShip = game.cpu.gameboard.placeShip;

      jest
        .spyOn(game.cpu.gameboard, "placeShip")
        .mockImplementation((ship, row, col, orientation) => {
          shipLengths.push(ship.length);
          return originalPlaceShip.call(
            game.cpu.gameboard,
            ship,
            row,
            col,
            orientation,
          );
        });

      game.placeCPUShipsRandomly();

      // Expected lengths: 5, 4, 3, 3, 2
      expect(shipLengths).toContain(5);
      expect(shipLengths).toContain(4);
      expect(shipLengths).toContain(3);
      expect(shipLengths).toContain(3);
      expect(shipLengths).toContain(2);
      expect(shipLengths.length).toBe(5);
    });

    test("should retry until all ships fit on board", () => {
      // This is more of a logic test - should eventually place all ships
      game.placeCPUShipsRandomly();

      // Verify all ships are placed without overlap
      const allPositions = new Set();
      let hasOverlap = false;

      // Check each ship's positions
      for (const ship of game.cpu.gameboard.ships) {
        for (const pos of ship.positions) {
          const key = `${pos.row},${pos.col}`;
          if (allPositions.has(key)) {
            hasOverlap = true;
            break;
          }
          allPositions.add(key);
        }
      }

      expect(hasOverlap).toBe(false);
      expect(game.cpu.gameboard.ships.length).toBe(5);
    });
  });
});

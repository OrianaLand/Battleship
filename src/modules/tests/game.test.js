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
    test("should place exactly 5 ships", () => {
      game.placeCPUShipsRandomly();
      expect(game.cpu.gameboard.ships.length).toBe(5);
    });

    test("should place all 5 ships for CPU with correct lengths", () => {
      game.placeCPUShipsRandomly();

      // Verify ship counts by getting all occupied cells and extracting unique ships
      const shipLengths = [];
      const seenShips = new Set();

      for (let row = 0; row < game.cpu.gameboard.size; row++) {
        for (let col = 0; col < game.cpu.gameboard.size; col++) {
          const cell = game.cpu.gameboard.grid[row][col];
          if (cell && !seenShips.has(cell)) {
            seenShips.add(cell);
            shipLengths.push(cell.getLength());
          }
        }
      }

      expect(shipLengths.sort()).toEqual([2, 3, 3, 4, 5]);
    });

    test("should place all 5 ships with no overlapping positions", () => {
      game.placeCPUShipsRandomly();

      // Verify all ships are placed (no placement failures)
      expect(game.cpu.gameboard.ships.length).toBe(5);

      // Verify no overlapping ships by checking grid

      let occupiedCells = 0;
      for (let row = 0; row < game.cpu.gameboard.size; row++) {
        for (let col = 0; col < game.cpu.gameboard.size; col++) {
          if (game.cpu.gameboard.grid[row][col] !== null) {
            occupiedCells++;
          }
        }
      }
      // 5+4+3+3+2 = 17 cells occupied
      expect(occupiedCells).toBe(17);

      // Verify all ships are placed without overlap by checking ship.length count matches
      const totalShipLenght = game.cpu.gameboard.ships.reduce(
        (sum, ship) => sum + ship.getLength(),
        0,
      );
      expect(occupiedCells).toBe(totalShipLenght);
    });
  });
});

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
});

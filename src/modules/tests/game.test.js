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
});

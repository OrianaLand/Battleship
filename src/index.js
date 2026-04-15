import "./styles.css";
import { Game } from "./modules/classes/game";
import { Ship } from "./modules/classes/ship";
console.log("Battleship console test");

const game = new Game();

// humans ships
game.placeHumanShip(new Ship(5), 0, 0, "H");
game.placeHumanShip(new Ship(4), 2, 0, "V");
game.placeHumanShip(new Ship(3), 4, 5, "V");
game.placeHumanShip(new Ship(3), 8, 2, "H");
game.placeHumanShip(new Ship(2), 2, 8, "H");

// start Game to place cup ships randomly
game.startGame();

// simulate a turn
const result = game.humanAttack(3, 4);
const cpuResult = game.cpuAttack(2, 7);

console.log(result);
console.log(cpuResult);
console.log(game.getState());
console.log(game.human.gameboard.ships);
console.log(game.human.gameboard.grid);
console.log(game.cpu.gameboard.grid);

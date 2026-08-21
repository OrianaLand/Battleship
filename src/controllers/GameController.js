import { Game } from "../modules/classes/Game";
import { Ship } from "../modules/classes/Ship";
import { GameView } from "../views/GameView";
import { SetupView } from "../views/SetupView";

export class GameController {
  #cpuThinking = false;
  constructor() {
    this.game = new Game();
    this.gameView = new GameView((row, col) =>
      this.#handleHumanAttack(row, col),
    );

    this.resetGameBtn = document.querySelector("#reset-btn");
    this.resetGameBtn.addEventListener("click", ()=>{ 
      this.reset();
    });

    this.placeShipsRandomlyBtn = document.querySelector("#random-btn");
    this.placeShipsRandomlyBtn.addEventListener("click", () =>{
      this.reset();
      this.setupView.placeHumanShipsRandomly();
    })

    this.difficultyButtons = document.querySelector("#difficulty-buttons"); // buttons container
    this.difficultyBtnList = document.querySelectorAll("#difficulty-buttons button"); // buttons list
    this.difficultyLabel = document.querySelector("#difficulty-label");
    this.difficulty = null;

    for (const btn of this.difficultyBtnList){
      btn.addEventListener("click", () => {
        this.difficulty = btn.dataset.difficulty;
        this.difficultyBtnList.forEach(b => b.classList.remove("active"));  
        btn.classList.add("active");
      });
    }

    this.confirmBtn = document.querySelector("#confirm-btn");
    this.confirmBtn.addEventListener("click", ()=>{
      if (!this.difficulty) {
        this.gameView.setMessage("You must choose a difficulty");
        return;   
        }
      this.#startGame();
    })

    this.appEl = document.querySelector("#app");
  }

  // initialize
  init() {
    this.#setupPhase();
  }

  #setupPhase() {
    const ships = [
    new Ship(5),
    new Ship(4),
    new Ship(3),
    new Ship(3),
    new Ship(2),
  ];

  this.placeShipsRandomlyBtn.style.display = "";
  this.difficultyButtons.style.display = "";
  this.difficultyLabel.textContent = "Choose difficulty";
  
  this.resetGameBtn.textContent = "Reset game";

  const humanBoardContainer = document.querySelector("#human-board");
  const controlsContainer = document.querySelector("#ship-tools");
  const onShipPlaced = (ship, row, col, orientation) => {
    const placed = this.game.placeHumanShip(ship, row, col, orientation);
    return placed;
  }
  const onComplete = () => {
    this.setupView.clear();
    this.#initViews();
    this.placeShipsRandomlyBtn.style.display = "none";
    this.confirmBtn.disabled = false;
  }

  this.setupView = new SetupView(
  humanBoardContainer,
  document.querySelector("#ship-list-box"),
  document.querySelector("#tools-box"),
  onShipPlaced,
  onComplete
);

  this.setupView.render(this.game.human.gameboard, ships);

  this.confirmBtn.disabled = true;
  this.confirmBtn.style.display = "";
  }

  #startGame() {
    this.game.startGame();
    this.placeShipsRandomlyBtn.style.display = "none";
    this.game.cpu.difficulty = this.difficulty;
    this.difficultyButtons.style.display = "none";
    this.difficultyLabel.textContent = `Difficulty: ${this.difficulty[0].toUpperCase() + this.difficulty.slice(1)}`;
    this.confirmBtn.style.display = "none";
    this.gameView.setMessage("Game started — your turn");
    this.appEl.classList.add("playing");                   
  }

  #initViews() {
    this.gameView.renderBoards(
      this.game.human.gameboard,
      this.game.cpu.gameboard,
    );
  }

  #handleHumanAttack(row, col) {
    if (this.game.state !== "playing" || this.game.currentTurn !== "human")
      return;
    if (this.#cpuThinking) return;

    try {
      const result = this.game.humanAttack(row, col);
      this.gameView.updateCpuBoard(row, col);
      this.gameView.setMessage(`You attacked (${row}, ${col}): ${result}`);
      this.gameView.setTurn(`Current turn: ${this.game.currentTurn}`);

      if (this.game.state === "over") {
        this.#handleGameOver();
        return;
      }

      if (result === "miss" && this.game.state === "playing") {
        this.#cpuThinking = true;
        this.#handleCpuAttack().finally(() => {
          this.#cpuThinking = false;
        });
      }
    } catch (e) {
      console.warn(e.message);
    }
  }

  async #handleCpuAttack() {
    if (this.game.state !== "playing") return;

    await this.#sleep(1000);

    if (this.game.state !== "playing") return;

    const { row, col, result } = this.game.cpuAttack();
    this.gameView.updateHumanBoard(row, col);
    this.gameView.setMessage(`CPU attacked (${row}, ${col}): ${result}`);
    this.gameView.setTurn(`Current turn: ${this.game.currentTurn}`);


    if (this.game.state === "over") {

      this.#handleGameOver();
      return;
    }

    if (result === "hit") {
      await this.#handleCpuAttack(); // CPU gets another turn
    }
  }

  #handleGameOver(){
    this.gameView.showGameOver(this.game.winner);
    this.resetGameBtn.textContent = "Play again";
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(){
    this.setupView.clear()

    const cpuBoardContainer = document.querySelector("#cpu-board");

    cpuBoardContainer.innerHTML = "";

    this.gameView.setMessage("");
    this.gameView.setTurn("");

    this.appEl.classList.remove("playing");
    this.game = new Game();
    this.#cpuThinking = false;
    this.#setupPhase();
  }
}

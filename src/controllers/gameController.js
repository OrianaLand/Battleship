import { createBoardGrid, updateCell } from "../dom/renderBoard";
export class gameController{
    constructor(game){
        this.game = game;
        this.views = [];
    }

    // init two board

    initBoards(this.game){
        createBoardGrid(this.game.human.gameBoard);
        createBoardGrid(this.game.cpu.gameBoard);
    }
    //handle human attack on cpu grid
}
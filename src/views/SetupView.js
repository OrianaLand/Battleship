import { createBoardGrid } from "../dom/renderBoard";

export class SetupView {
    #grid = null;
    #board = null;
    #ships = [];
    #selectedShip = null;
    #selectedBtn = null;
    #orientation = "H";
    #placedCount = 0;
    #rotateBtn;
    #onShipPlaced;
    #onComplete;
    #lastRow = null;
    #lastCol = null;

    constructor(container, onShipPlaced, onComplete){
        this.container = container;
        this.#onShipPlaced = onShipPlaced;
        this.#onComplete = onComplete;
    }

    render(board, ships){
        this.#board= board;
        this.#ships = ships; // array of Ship instances to place
        this.#grid = createBoardGrid(board, this.container);
        this.#attachGridListeners();
        this.#renderShipList(ships);
        this.#renderRotateButton();        
    }

    // --- Ship list --- //

    #renderShipList(ships) {
        const list = document.createElement("div");
        list.id = "ship-list";

        for(const ship of ships){
            const btn = document.createElement("button");
            btn.textContent = `Ship (${ship.getLength()})`;
            btn.addEventListener("click", () => this.#selectShip(ship, btn));
            list.appendChild(btn);
        }

        this.container.appendChild(list);
    }

    #selectShip(ship, btn){
        //Deselect previous
        document.querySelectorAll("#ship-list button").forEach((b)=> b.classList.remove("selected"));

        btn.classList.add("selected");
        this.#selectedShip = ship;
        this.#selectedBtn = btn;
    }

    // ---- Orientation --- //

    #renderRotateButton(){
        const btn = document.createElement("button");
        btn.id = "rotate-btn";
        btn.textContent = `Orientation: ${this.#orientation}`;
        btn.addEventListener("click", () => this.#toggleOrientation());
        this.container.appendChild(btn);
        this.#rotateBtn = btn;
    }

    #toggleOrientation (){
        this.#orientation = this.#orientation === 'H' ? 'V' : 'H';
        this.#rotateBtn.textContent = `Orientation: ${this.#orientation}`;
        this.#clearPreview();
        if(this.#lastRow === null && this.#lastCol === null) return;
        this.#showPreview(this.#lastRow, this.#lastCol);
    }

    // --- Grid Listeners --- //


    #attachGridListeners() {
        this.#grid.addEventListener("mouseover", (e) => {
            const cell = e.target.closest(".cell");
            if(!cell || !this.#selectedShip) return;

            this.#lastRow = parseInt(cell.dataset.row);
            this.#lastCol = parseInt(cell.dataset.col);

            this.#showPreview(this.#lastRow, this.#lastCol);
        });

        this.#grid.addEventListener("mouseleave", () =>{
            this.#lastRow = null;
            this.#lastCol = null;
            this.#clearPreview();
        })

        this.#grid.addEventListener("click", (e) =>{
            const cell = e.target.closest(".cell");
            if(!cell || !this.#selectedShip) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            this.#placeShip(row, col);
        })

        this.#grid.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.#toggleOrientation();
        }, {passive: false});
    }

    // --- Preview --- //

    #showPreview(row, col) {
        this.#clearPreview();

        if(this.#selectedShip === null) return;
        const cells = this.#getShipCells(row, col);
        const isValid = this.#board.isValidPlacement(
            this.#selectedShip, row, col, this.#orientation
        );

        for(const [r, c] of cells) {
            const cell = this.#grid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if(!cell) continue;
            cell.classList.add(isValid ? "preview-valid" : "preview-invalid");
        }
    }

    #clearPreview(){
        this.#grid
        .querySelectorAll(".preview-valid, .preview-invalid")
        .forEach((cell) =>{
            cell.classList.remove("preview-valid", "preview-invalid");
        });
    }

    #getShipCells(row, col) {
        const cells = [];
        for(let i= 0; i < this.#selectedShip.getLength(); i++){
            const r = this.#orientation === "H" ? row : row + i;
            const c = this.#orientation === "H" ? col + i : col;
            cells.push([r, c]);
        }

        return cells;
    }

    // --- Placement ----

    #placeShip(row, col){
        if (!this.#selectedShip) return;

        const placed = this.#onShipPlaced(
            this.#selectedShip, row, col, this.#orientation
        );

        if (placed){
            this.#markPlaced(row, col);
            this.#placedCount++;
            this.#removeFromList(this.#selectedBtn);
            this.#selectedShip = null;
            this.#selectedBtn = null;
        }

        if(this.#placedCount === this.#ships.length) this.#onComplete();
    }

    #markPlaced(row, col){
        const cells = this.#getShipCells(row, col);

        for(const [r, c] of cells){
            const cell = this.#grid.querySelector(`[data-row="${r}"][data-col="${c}"]`);

            if (cell) cell.classList.add("ship");
        }
    }

    #removeFromList(btn){
        if(btn) btn.remove();
    }

    clear(){
        this.container.innerHTML = '';
    }
}

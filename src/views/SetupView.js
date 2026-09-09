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
    #dragGhost = null;
    #dragging = false;
    #shipListContainer;
    #toolsContainer;

    constructor(container, shipListContainer, toolsContainer, onShipPlaced, onComplete){
        this.container = container;
        this.#shipListContainer = shipListContainer;
        this.#toolsContainer = toolsContainer;
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


            btn.addEventListener("pointerdown", (e) => {
                this.#selectShip(ship, btn);
                btn.setPointerCapture(e.pointerId)
                this.#dragging = true;

                this.#dragGhost = document.createElement("div");
                this.#dragGhost.className = "drag-ghost";
                this.#dragGhost.textContent = `Ship (${ship.getLength()})`;
                document.body.appendChild(this.#dragGhost);
                this.#moveGhost(e);
            });

            btn.addEventListener("pointerup", (e)=>{
                const element = document.elementFromPoint(e.clientX, e.clientY);
                const cell = element?.closest(".cell")
                this.#dragging = false;
                this.#dragGhost?.remove();
                this.#dragGhost = null;

                if(cell){
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    this.#placeShip(row, col);
                }

                this.#deselect();
            })

            btn.addEventListener("pointermove", (e) =>{
                if(this.#dragging){
                    const element = document.elementFromPoint(e.clientX, e.clientY);
                    const cell = element?.closest(".cell");
                    this.#moveGhost(e);

                    if(cell){
                        this.#lastRow = parseInt(cell.dataset.row);
                        this.#lastCol = parseInt(cell.dataset.col);
                        
                        this.#showPreview(this.#lastRow, this.#lastCol);
                    }else{
                        this.#lastRow = null;
                        this.#lastCol = null;
                        this.#clearPreview();  
                    }
                }
            })
            list.appendChild(btn);
        }

        this.#shipListContainer.appendChild(list);
    }

    #selectShip(ship, btn){
        //Deselect previous
        document.querySelectorAll("#ship-list button").forEach((b)=> b.classList.remove("selected"));

        btn.classList.add("selected");
        this.#selectedShip = ship;
        this.#selectedBtn = btn;
    }

    #deselect(){
        if(this.#selectedBtn){
            this.#selectedBtn.classList.remove("selected");
            this.#selectedShip = null;
            this.#selectedBtn = null;
            this.#clearPreview();
        }
    }

    // ---- Orientation --- //

    #renderRotateButton(){
        const btn = document.createElement("button");
        btn.id = "rotate-btn";
        btn.textContent = `${this.#orientation}`;
        btn.addEventListener("click", () => this.#toggleOrientation());
        this.#toolsContainer.appendChild(btn);
        this.#rotateBtn = btn;
    }

    #toggleOrientation (){
        this.#orientation = this.#orientation === 'H' ? 'V' : 'H';
        this.#rotateBtn.textContent = `${this.#orientation}`;
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

    // --- Placement --- //

    #placeShip(row, col){
        if (!this.#selectedShip) return;

        const placed = this.#onShipPlaced(
            this.#selectedShip, row, col, this.#orientation
        );

        if (placed){
            this.#markPlaced(row, col);
            this.#clearPreview();
            this.#placedCount++;
            this.#selectedBtn.disabled = true;
            /* this.#removeFromList(this.#selectedBtn); */
            this.#selectedBtn.classList.add("placed");
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

    finishPlacement(){
        this.container.innerHTML = '';       // limpia la grilla de setup (el tablero de juego se renderiza acá)
        this.#rotateBtn.disabled = true;     // rotate visible pero desactivado
    }

    /* #removeFromList(btn){
        if(btn) btn.remove();
    } */

    placeHumanShipsRandomly(){
        for (const ship of this.#ships){
            let placed = false;
            while (!placed){
                const row = Math.floor(Math.random() * this.#board.size);
                const col = Math.floor(Math.random() * this.#board.size);
                const orientation = Math.random() < 0.5 ? "H" : "V";
                placed = this.#onShipPlaced(ship, row, col, orientation);
            }
        }

        this.#onComplete();
    }

    // --- Helpers --- //

    clear(){
        this.container.innerHTML = '';
        this.#shipListContainer.innerHTML = '';
        this.#rotateBtn?.remove();
    }

    #moveGhost(e){
        this.#dragGhost.style.left = `${e.clientX}px`;
        this.#dragGhost.style.top = `${e.clientY}px`;
    }
}

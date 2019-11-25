export class Board {
  constructor(canvas, document, shrinkage = 1){
    this._canvas = canvas;
    this._document = document;
    this._shrinkage = shrinkage;
  }

  get canvas() { return this._canvas; }
  set canvas(canvas) { this._canvas = canvas; }

  get ctx() { return this._ctx; }
  setContext(context = this._canvas.getContext("2d")) { this._ctx = context; }

  get document() { return this._document; }
  set document(document) { this._document = document; }

  get shrinkage() { return this._shrinkage; }
  set shrinkage(shrinkage) { this._shrinkage = shrinkage; }

  clearBoard() {
    this._shrinkage = 1;
  }

  resetBoard() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._shrinkage = 1;
  }

  resizeCanvas(img) {
    this._shrinkage = 1;
    const appContainer = this._document.getElementsByClassName("app-Container")[0];
    const main = this._document.getElementsByClassName("main")[0];
    this._canvas.height = img.height;
    this._canvas.width = img.width;
    let yShrink = 0;
    if(this._canvas.width > appContainer.offsetWidth) {
      this._shrinkage = appContainer.offsetWidth/this._canvas.width;
    }
    if(this._canvas.height > main.offsetHeight) {
      yShrink = main.offsetHeight/this._canvas.height;
      if(yShrink < this._shrinkage) this._shrinkage = yShrink;
    }
    this._canvas.width = this._canvas.width * this._shrinkage;
    this._canvas.height = this._canvas.height * this._shrinkage;
  }
}

export function initializeNewBoard(canvas, document) {
  let board = new Board(canvas, document);
  board.setContext();
  return board;
}



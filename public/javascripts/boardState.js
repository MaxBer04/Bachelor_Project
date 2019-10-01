import * as poly from "./polygon.js";

export class BoardState {
  constructor(boardConfig, currentPolygonCollection, currentPolygon, hoveredPolygons) {
    this._boardConfig = boardConfig;
    this._currentPolygonCollection = currentPolygonCollection;
    this._currentPolygon = currentPolygon;
    this._hoveredPolygons = hoveredPolygons;
  }

  get boardConfig() { return this._boardConfig; }
  set boardConfig(boardConfig) { this._boardConfig = boardConfig; }

  get currentPolygonCollection() { return this._currentPolygonCollection; }
  set currentPolygonCollection(collection) { this._currentPolygonCollection = collection; }

  get currentPolygon() { return this._currentPolygon; }
  set currentPolygon(polygon) { this._currentPolygon = polygon; }

  get hoveredPolygons() { return this._hoveredPolygons; }
  set hoveredPolygons(polygon) { this._hoveredPolygons = polygon; }

  addNewCurrentPolygon(polygon) {
    this._currentPolygonCollection.addPolygon(polygon);
    this._currentPolygon = polygon;
  }

  revertAndRemoveCurrentPolygon() {
    this._currentPolygon = this._currentPolygonCollection.polygons[this._currentPolygonCollection.polygons.length-2];
    this._currentPolygonCollection.removePolygon(this._currentPolygonCollection.polygons.length-1);
  }

  reset() {
    this._boardConfig.softreset();
    this._currentPolygonCollection = new poly.PolygonCollection();
    this._currentPolygon = new poly.Polygon();
    this._currentPolygonCollection.addPolygon(this._currentPolygon);
  }
}



export class BoardStateHistory {
  constructor() {
    this._history = [];
    this._position = -1;
  }

  get history() { return this._history; }
  get position() { return this._position; }

  undoBoardState() {
    if(this._position === 0) return; // ersten BoardState erreicht
    this._position -= 1;
    return _.cloneDeep(this._history[this._position]);
  }

  redoBoardState() {
    if(this._position === this._history.length-1) return; //aktuellster BoardState erreicht
    this._position += 1;
    return _.cloneDeep(this._history[this._position]);
  }

  copyBoardStateToHistory(boardState) {
    // Alle möglichen Redos löschen
    for(let i = this._history.length; i > this._position+1; i--) {
      this._history.pop();
    }

    let boardStateCopy = _.cloneDeep(boardState);
    this._history.push(boardStateCopy);
    this._position++;
  }

  reset() {
    this._history = [];
    this._position = -1;
  }
}



export class BoardConfig {
  constructor(canvas, document, shrinkage = 1){
    this._canvas = canvas;

    this._ctx = this._canvas.getContext("2d");
    this._ctx._strokeStyleDefault = "#555555";
    this._ctx._strokeStyleFinished = '#003c8f';
    this._ctx._lineCapDefault = "square";
    this._ctx._defaultLineWidth = "1px";
    this._ctx._pointThickness = 4;

    this._document = document;
    this._shrinkage = shrinkage;
  }

  get canvas() { return this._canvas; }
  set canvas(canvas) { this._canvas = canvas; }

  get ctx() { return this._ctx; }
  setExternalContext(context) { this._ctx = context; }
  setContext(context = this._canvas.getContext("2d")) { this._ctx = context; }

  get document() { return this._document; }
  set document(document) { this._document = document; }

  get shrinkage() { return this._shrinkage; }
  set shrinkage(shrinkage) { this._shrinkage = shrinkage; }

  softreset() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  reset() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._shrinkage = 1;
  }

  resizeCanvasToFit(img) {
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

  clear() {
    this_.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
}

export function initializeNewBoardState(boardConfig) {
  let polygon = new poly.Polygon();
  let boardState = new BoardState(boardConfig, new poly.PolygonCollection(), polygon);
  boardState.currentPolygonCollection.addPolygon(polygon);
  return boardState;
}
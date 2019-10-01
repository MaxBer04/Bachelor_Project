export class Drawer {
  constructor(boardState, boardConfigImage, viewState) {
    this._boardState = boardState;
    this._boardConfigImage = boardConfigImage;
    this._viewState = viewState;
    this._colors = ['rgba(0, 0, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 255, 0, 0.5)', 'rgba(255, 0, 255, 0.5)', 'rgba(255, 128, 0, 0.5)'];
    this._ctx = boardState.boardConfig.ctx;
  }

  set boardState(boardState) { 
    this._boardState = boardState;
    this._ctx = boardState.boardConfig.ctx;
  }

  set colors(colorArray) { this._colors = colorArray; }

  selectPolygonFillColor(polygon) {
    if(this._colors.length === 0) this._colors = ['rgba(0, 0, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 255, 0, 0.5)', 'rgba(255, 0, 255, 0.5)', 'rgba(255, 128, 0, 0.5)'];;
    const num = Math.floor(Math.random()*this._colors.length);
    if(polygon) polygon.fillColor = this._colors[num];
    return this._colors.splice(num, 1)[0];
  }

  scaleThicknessOnZoom(factor) {
    this._ctx._pointThickness *= 1/factor;
  }

  drawPoint(x, y){
    const d = this._ctx._pointThickness;
    this._ctx.fillStyle="white";
    this._ctx.strokeStyle = "black";
    this._ctx.fillRect(x-d/2,y-d/2,d,d);
  }

  drawPolygon(polygon, finished){
    this._ctx.lineWidth = this._ctx._defaultLineWidth;
  
    this._ctx.beginPath();
    for(var i=0; i<polygon.points.length; i++){
      let X = polygon.points[i]['X'];
      let Y = polygon.points[i]['Y'];
      if(i==0){
        this._ctx.moveTo(X, Y);
        this.drawPoint(X, Y);
      } else {
        this._ctx.lineTo(X, Y);
        this.drawPoint(X, Y);
      }
    }
  
    if(finished) {
      this.finishPolygon(polygon);
      this._ctx.stroke();
      return;
    }
    this._ctx.stroke();
  }
  
  drawImage(img, boardConfigImage) {
    boardConfigImage.ctx.drawImage(img, 0, 0, boardConfigImage.canvas.width, boardConfigImage.canvas.height);
  }

  resetImageCanvas(boardConfigImage) {
    boardConfigImage.ctx.save();
    boardConfigImage.ctx.setTransform(1, 0, 0, 1, 0, 0);
    boardConfigImage.ctx.clearRect(0, 0, boardConfigImage.canvas.width, boardConfigImage.canvas.height);
    boardConfigImage.ctx.restore();
  }

  resetDrawingCanvas() {
    this._ctx.save()
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.clearRect(0, 0, this._boardState.boardConfig.canvas.width, this._boardState.boardConfig.canvas.height);
    this._ctx.restore();
  }

  clearAndDrawImage(img, boardConfigImage, imageWidth, imageHeight) {
    this.resetDrawingCanvas();
    this.resetImageCanvas(boardConfigImage);
    const {X: startX, Y: startY} = this._viewState.getTransformedPoint(0, 0);
    boardConfigImage.ctx.drawImage(img, -startX, -startY, boardConfigImage.canvas.width, boardConfigImage.canvas.height);
  }



  reDrawBoardState(boardState) {
    this._ctx.clearRect(0,0,boardState.boardConfig.canvas.width, boardState.boardConfig.canvas.height);
    for(let i = 0; i < boardState.currentPolygonCollection.polygons.length; i++) {
      this.drawPolygon(boardState.currentPolygonCollection.polygons[i], boardState.currentPolygonCollection.polygons[i].finished);
    }
  }

  finishPolygon(polygon) {
    this._ctx.lineTo(polygon.points[0]['X'], polygon.points[0]['Y']);
    this._ctx.closePath();
    this._ctx.fillStyle = (polygon.fillColor) ? polygon.fillColor : this.selectPolygonFillColor(polygon);
    this._ctx.fill();
    this._ctx.strokeStyle = this._ctx._strokeStyleFinished;
    polygon.finished = true;
  }

  resetDrawings() {
    this._ctx.clearRect(0, 0, this._boardState.boardConfig.canvas.width, this._boardState.boardConfig.canvas.height);
  }
}







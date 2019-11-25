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

  /*selectPolygonFillColor(polygon) {
    if(this._colors.length === 0) this._colors = ['rgba(0, 0, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 255, 0, 0.5)', 'rgba(255, 0, 255, 0.5)', 'rgba(255, 128, 0, 0.5)'];;
    const num = Math.floor(Math.random()*this._colors.length);
    if(polygon) polygon.fillColor = this._colors[num];
    return this._colors.splice(num, 1)[0];
  }*/

  selectPolygonFillColor(polygon) {
    const h = Math.random() * 360,
          s = 100,
          l = 75;
    const color = this.HSLToRGBA(h,s,l);
    if(polygon) polygon.fillColor = color;
    return color;
  }

  HSLToRGBA(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return `rgba(${r},${g},${b},0.5)`;
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

  drawCircle(polygon) {
    const p1 = polygon.points[0];
    const p2 = polygon.points[1];
    const span = Math.max(Math.abs(p2.X-p1.X), Math.abs(p2.Y-p1.Y));
    this._ctx.arc(p1.X+(p2.X-p1.X)*0.5, p1.Y+(p2.Y-p1.Y)*0.5, span*0.5, 0, 2* Math.PI);
    this._ctx.fillStyle = (polygon.fillColor) ? polygon.fillColor : this.selectPolygonFillColor(polygon);
    this._ctx.fill();
    this._ctx.strokeStyle = this._ctx._strokeStyleFinished;
  }

  drawPolygon(polygon, finished){
    this._ctx.lineWidth = this._ctx._defaultLineWidth;

    this._ctx.beginPath();
    if(polygon.shape === "Circle") this.drawCircle(polygon);
    else {
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
      }
    }

    if(polygon.selectedInEditor) {
      this._ctx.shadowBlur = 10;
      this._ctx.shadowColor = "black";
      this._ctx.stroke();
      this._ctx.shadowBlur = 0;
      this._ctx.shadowColor = "";
      return;
    }
    //this._ctx.restore();
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
    this._ctx.fillStyle = (polygon.fillColor) ? polygon.fillColor : this.selectPolygonFillColor(polygon);
    this._ctx.fill();
    this._ctx.strokeStyle = this._ctx._strokeStyleFinished;
    this._ctx.closePath();
    polygon.finished = true;
  }

  resetDrawings() {
    this._ctx.clearRect(0, 0, this._boardState.boardConfig.canvas.width, this._boardState.boardConfig.canvas.height);
  }
}




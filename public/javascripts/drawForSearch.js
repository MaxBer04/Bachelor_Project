import * as poly from "./polygon.js";

export class drawerForSearch {
  constructor() {
    this._canvas = document.getElementById("searchCanvas");
    this._ctx = this._canvas.getContext("2d");
    this._ctx._strokeStyleDefault = "#555555";
    this._ctx._strokeStyleFinished = '#003c8f';
    this._ctx._lineCapDefault = "square";
    this._ctx._defaultLineWidth = "1px";
    this._ctx._pointThickness = 4;
    this._shrinkage = 1;
  }

  reDrawImageAndBoard(imagePath, boardState) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      let realThis = this;
      img.addEventListener("load", function () {
        //imageWidth = img.width;
        //imageHeight = img.height;
        realThis.resizeCanvasToFit(img);
        realThis._ctx.clearRect(0,0, realThis._canvas.width, realThis._canvas.height);
        realThis._ctx.drawImage(img, 0, 0, realThis._canvas.width, realThis._canvas.height);
        realThis.reDrawBoardState(boardState);
        resolve();
      });
      img.src = imagePath;
    });
  }

  reDrawBoardState(unscaledBoardState) {
    let scaledPolygonCollection = poly.getBackscaledPolygons(unscaledBoardState._currentPolygonCollection, this._shrinkage);
    for(let i = 0; i < scaledPolygonCollection.polygons.length; i++) {
      this.drawPolygon(scaledPolygonCollection.polygons[i], scaledPolygonCollection.polygons[i].finished);
    }
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
    this._ctx.stroke();
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
    this._ctx.fillStyle = polygon.fillColor;
    this._ctx.fill();
    this._ctx.strokeStyle = this._ctx._strokeStyleFinished;
  }

  finishPolygon(polygon) {
    this._ctx.lineTo(polygon.points[0]['X'], polygon.points[0]['Y']);
    this._ctx.fillStyle = polygon.fillColor;
    this._ctx.fill();
    this._ctx.strokeStyle = this._ctx._strokeStyleFinished;
    this._ctx.closePath();
    polygon.finished = true;
  }

  resizeCanvasToFit(img) {
    let shrinkage = 1;
    const canvasContainer = document.getElementsByClassName("canvas-container")[0];
    this._canvas.height = img.height;
    this._canvas.width = img.width;
    let yShrink = 0;
    if(this._canvas.width > canvasContainer.offsetWidth) {
      shrinkage = canvasContainer.offsetWidth/this._canvas.width;
    }
    if(this._canvas.height > canvasContainer.offsetHeight) {
      yShrink = canvasContainer.offsetHeight/this._canvas.height;
      if(yShrink < shrinkage) shrinkage = yShrink;
    }
    this._shrinkage = shrinkage;
    this._canvas.width = this._canvas.width * shrinkage;
    this._canvas.height = this._canvas.height * shrinkage;
  }
}


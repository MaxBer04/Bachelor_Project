"use strict";
import * as poly from "./polygon.js";
import * as viewStateConstructor from "./viewState.js";
import * as drawerConsturctor from "./draw.js";
import * as boardStateConstructor from "./boardState.js";
import * as editorConstructor from "./editor.js";
import * as login from "./logger.js";
import * as imageSliderConstructor from './imageSlider.js';

export let socket;
let firstTime = true;
let imageSlider;
let boardConfigImage;
let boardConfigDraw;
export let boardState;
export let boardStateHistory;
let drawer;
let editor;
let viewState;
let dragStart;
let drawStart;
let currentlyDrawing;
let imageWidth;
let imageHeight;
let img;
let editorTool = false;
let drawDevice = "Lines";
let supportedZoomMode = false;



export function customAlert(text) {
  const alertBox = document.getElementsByClassName("alert-box")[0];
  const alertText = document.getElementById("alertText");
  alertText.innerHTML = text;
  alertBox.classList.add("showAndfadeOut");
  setTimeout(function(){alertBox.classList.remove("showAndfadeOut");}, 3000);
};

function checkIfInPic(X, Y) {
  const endX = Math.round(imageWidth*boardState.boardConfig.shrinkage);
  const endY = Math.round(imageHeight*boardState.boardConfig.shrinkage);
  return ((X > 0 && X < endX) && (Y > 0 && Y< endY));
}

let lastX, lastY;
function getTranslatedMousePosition(evt) {
  try {
    let originalX = evt.offsetX || (evt.pageX - boardState.boardConfig.canvas.offsetLeft);
    let originalY = evt.offsetY || (evt.pageY - boardState.boardConfig.canvas.offsetTop);
    let {X, Y} = viewState.getTransformedPoint(originalX, originalY);
    // Falls aufgrund von lags o.ä. der Browser die Mouse Position nicht direkt übermitteln kann, die letztbekannte Position zurückgeben
    lastX = X;
    lastY = Y;
    return {X, Y};
  } catch(error) {
    if (error instanceof ReferenceError) {
      return({X: lastX, Y: lastY});
    }
  }
}

function getMousePosition(evt) {
  let X = evt.offsetX || (evt.pageX - canvas.offsetLeft);
  let Y = evt.offsetY || (evt.pageY - canvas.offsetTop);
  return {X, Y};
}

function getHoveredPolygons(X, Y) {
  let currentPolygonCollection = boardState.currentPolygonCollection;
  let ctx = boardState.boardConfig.ctx;
  let hoveredPolygons = new poly.PolygonCollection();
  for(let k = 0; k < currentPolygonCollection.polygons.length; k++) {
    if(!currentPolygonCollection.polygons[k].finished) continue;

    const currentPolygon = currentPolygonCollection.polygons[k];
    const {X: startX, Y: startY} = viewState.getTransformedPoint(currentPolygon.points[0]['X'], currentPolygon.points[0]['Y'])
    ctx.beginPath();
    let path = new Path2D();
    path.moveTo(startX, startY);
    for(let i=0; i<currentPolygon.points.length; i++){
      const {X: pointX, Y: pointY} = viewState.getTransformedPoint(currentPolygon.points[i]['X'], currentPolygon.points[i]['Y'])
      path.lineTo(pointX, pointY);
    }
    path.lineTo(startX, startY);
    path.closePath();
    if(ctx.isPointInPath(path, X, Y)) hoveredPolygons.addPolygon(currentPolygon);
  }
  return hoveredPolygons;
}

function checkIntersect(x,y){
  let currentPolygon = boardState.currentPolygon;
  if(currentPolygon.points.length < 4){
    return false;
  }
  let p0 = new Array();
  let p1 = new Array();
  let p2 = new Array();
  let p3 = new Array();

  p2['X'] = currentPolygon.points[currentPolygon.points.length-1]['X'];
  p2['Y'] = currentPolygon.points[currentPolygon.points.length-1]['Y'];
  p3['X'] = x;
  p3['Y'] = y;

  for(var i=0; i<currentPolygon.points.length-1; i++){
    p0['X'] = currentPolygon.points[i]['X'];
    p0['Y'] = currentPolygon.points[i]['Y'];
    p1['X'] = currentPolygon.points[i+1]['X'];
    p1['Y'] = currentPolygon.points[i+1]['Y'];
    if(p1['X'] == p2['X'] && p1['Y'] == p2['Y']){ continue; }
    if(p0['X'] == p3['X'] && p0['Y'] == p3['Y']){ continue; }
    if(lineIntersects(p0,p1,p2,p3)==true){
      return true;
    }
  }
  return false;
}


function lineIntersects(p0, p1, p2, p3) {
  let s1_x, s1_y, s2_x, s2_y;
  s1_x = p1['X'] - p0['X'];
  s1_y = p1['Y'] - p0['Y'];
  s2_x = p3['X'] - p2['X'];
  s2_y = p3['Y'] - p2['Y'];
0
  let s, t;
  s = (-s1_y * (p0['X'] - p2['X']) + s1_x * (p0['Y'] - p2['Y'])) / (-s2_x * s1_y + s1_x * s2_y);
  t = ( s2_x * (p0['Y'] - p2['Y']) - s2_y * (p0['X'] - p2['X'])) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
  {
    // Kollision 
    return true;
  }
  return false; // Keine Kollision
}

function handleScroll(evt){
  var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
  evt.preventDefault();
  return delta;
};

function handlePoint(X, Y) {
  if(boardState.currentPolygon.finished) boardState.addNewCurrentPolygon(new poly.Polygon([], false, drawer.selectPolygonFillColor()));
  if (boardState.currentPolygon.points.length>0 && X == boardState.currentPolygon.points[boardState.currentPolygon.points.length-1]['x'] && Y == boardState.currentPolygon.points[boardState.currentPolygon.points.length-1]['y']){
    // doppelter Punkt
    return false;
  }
  if(checkIntersect(X,Y)){
    customAlert('The line you are drawing intersect another line');
    return false;
  }

  boardState.currentPolygon.addPoint({'X':X,'Y':Y});
  drawer.drawPolygon(boardState.currentPolygon, false);
  boardStateHistory.copyBoardStateToHistory(boardState);
  return false;
}

function handleFinishPoint() {
  if(boardState.currentPolygon.points.length<=2){
    customAlert('You need at least three points for a polygon');
    return false;
  }
  // Punkte, um zu checken, ob das Schließen des Polygons eine gekreuzte Linie erzeugen würde
  let firstX = boardState.currentPolygon.points[0]['X'];
  let firstY = boardState.currentPolygon.points[0]['Y'];

  if(checkIntersect(firstX, firstY)){
    customAlert('The line you are drawing intersect another line');
    return false;
  }

  drawer.drawPolygon(boardState.currentPolygon, true);
  editor.populateOptionList()
  boardStateHistory.copyBoardStateToHistory(boardState);
  return false;
}

function handleDrag(dragStart, X, Y) {
  viewState.translate(dragStart["X"], dragStart["Y"], X, Y);
  drawer.clearAndDrawImage(img, boardConfigImage, imageWidth, imageHeight);
  drawer.reDrawBoardState(boardState);
}

function startRectangle(startX, startY) {
  const rectangle = new poly.Polygon([{X:startX, Y:startY}], true, drawer.selectPolygonFillColor());
  boardState.addNewCurrentPolygon(rectangle);
  drawer.reDrawBoardState(boardState);
}

function drawDynamicRectangle(newX, newY) {
  // Das currentPolygon ist/sollte hier das zu malende Rechteck sein
  const {X: startX, Y: startY} = boardState.currentPolygon.points[0];
  // Punkte berechnen
  const p2 = {X: startX, Y: newY};
  const p3 = {X: newX, Y: newY};
  const p4 = {X: newX, Y: startY};
  if(boardState.currentPolygon.points.length === 1) {
    boardState.currentPolygon.addPoints([p2, p3, p4]);
  }
  else {
    boardState.currentPolygon.replacePoint(1, p2);
    boardState.currentPolygon.replacePoint(2, p3);
    boardState.currentPolygon.replacePoint(3, p4);
  }
  drawer.reDrawBoardState(boardState);
}

function finishRectangle() {
  drawer.reDrawBoardState(boardState);
  editor.populateOptionList();
  boardStateHistory.copyBoardStateToHistory(boardState);
}

function startTriangle(startX, startY) {
  const triangle = new poly.Polygon([{X:startX, Y:startY}], true, drawer.selectPolygonFillColor());
  boardState.addNewCurrentPolygon(triangle);
  drawer.reDrawBoardState(boardState);
}

function drawDynamicTriangle(newX, newY) {
  // Das currentPolygon ist/sollte hier das zu malende Dreieck sein
  const {X: startX, Y: startY} = boardState.currentPolygon.points[0];
  // Punkte berechnen
  const p2 = {X: newX, Y: startY};
  const p3 = {X: Math.round(startX+(newX-startX)/2), Y: newY};
  if(boardState.currentPolygon.points.length === 1) {
    boardState.currentPolygon.addPoints([p2, p3]);
  }
  else {
    boardState.currentPolygon.replacePoint(1, p2);
    boardState.currentPolygon.replacePoint(2, p3);
  }
  drawer.reDrawBoardState(boardState);
}

function finishTriangle() {
  drawer.reDrawBoardState(boardState);
  editor.populateOptionList();
  boardStateHistory.copyBoardStateToHistory(boardState);
}

export function newSelectedPolygon(polygon) {
  //remove old selected
  boardState.currentPolygonCollection.polygons.forEach((pol) => {
    if(pol.ID !== polygon.ID && pol.selectedInEditor) pol.selectedInEditor = false;
  });
  drawer.reDrawBoardState(boardState);
}

function reset() {
  boardState.reset();
  drawer.resetDrawings();
  editor.populateOptionList();
  boardStateHistory.copyBoardStateToHistory(boardState);
}

function clearCanvases() {
  boardConfigImage.ctx.setTransform(1,0,0,1,0,0);
  boardConfigDraw.ctx.setTransform(1,0,0,1,0,0);
  const {X: X1, Y: Y1} = viewState.getTransformedPoint(boardConfigImage.canvas.width, boardConfigImage.canvas.height);
  const {X: X2, Y: Y2} = viewState.getTransformedPoint(boardConfigDraw.canvas.width, boardConfigDraw.canvas.height);
  boardConfigImage.ctx.clearRect(0,0,X1, Y1);
  boardConfigDraw.ctx.clearRect(0,0,X2, Y2);
}

function createBoardStateFromServerResponse(serverResponse) {
  const polygonCollection = new poly.PolygonCollection();
  const polygons = serverResponse.polygonCollection;
  for(let i = 0; i < polygons.length; i++) {
    const points = [];
    for(let k = 0; k < polygons[i].points.length; k++) {
      points.push(polygons[i].points[k]);
    }
    const attributes = [];
    for(let m = 0; m < polygons[i].attributes.length; m++) {
      attributes.push(new poly.Attribute(polygons[i].attributes[m].text));
    }
    const polygon = new poly.Polygon(points, true, polygons[i].color, polygons[i].shape, polygons[i].text, polygons[i].name);
    polygon.attributes = attributes;
    polygonCollection.addPolygon(polygon);
  }
  const currentPolygon = new poly.Polygon();
  const backscaledPolygonCollection = poly.getBackscaledPolygons(polygonCollection, boardConfigDraw.shrinkage);
  return new boardStateConstructor.BoardState(undefined, backscaledPolygonCollection, currentPolygon);
}

async function getBoardIfAnnotated(imageID) {
  return new Promise((resolve, reject) => {
    let boardState = undefined;
    const request = new XMLHttpRequest();
    request.open('GET', `/main/loadAnnotations/${imageID}`, true);
    request.onreadystatechange = () => {
      if(request.readyState === 4 && request.status === 200) {
        const response = JSON.parse(request.responseText);
        if(!(Object.keys(response).length === 0 && response.constructor === Object)) { // Not an empty object
          boardState = createBoardStateFromServerResponse(response);
        } 
        resolve(boardState);
      }
    }
    request.send();
  });
}

export async function loadNewImage(imageID, path) {
  if(!boardState.saved) {
    if(confirm("Your annotations are not saved, are you sure you want to continue?")) {
      if(document.querySelector(".image-container.active")) { 
        const oldImageID = document.querySelector(".image-container.active").firstChild.getAttribute("data-id");
        socket.emit('unlock', oldImageID);
      }
      socket.emit('lock', imageID);
      const loadDIV = document.getElementsByClassName("waitForSave")[0];
      loadDIV.classList.add("display");
      let imageSetID = boardState.imageSetID;
      poly.IDList.splice(0, poly.IDList.length);
      poly.IDListAttributes.splice(0, poly.IDListAttributes.length);
      editor.clear();
      await initialize(path, imageID);
      boardState.imageID = imageID;
      boardState.imageSetID = imageSetID;
      loadDIV.classList.remove("display");
      return true;
    }
  } else {
      if(document.querySelector(".image-container.active")) { 
        const oldImageID = document.querySelector(".image-container.active").firstChild.getAttribute("data-id");
        socket.emit('unlock', oldImageID);
      }
      socket.emit('lock', imageID);
      const loadDIV = document.getElementsByClassName("waitForSave")[0];
      loadDIV.classList.add("display");
      let imageSetID = boardState.imageSetID;
      poly.IDList.splice(0, poly.IDList.length);
      poly.IDListAttributes.splice(0, poly.IDListAttributes.length);
      editor.clear();
      await initialize(path, imageID);
      boardState.imageID = imageID;
      boardState.imageSetID = imageSetID;
      loadDIV.classList.remove("display");
      return true;
  }
  return false;
}

export async function loadSetIntoApp(imageSetID) {
  let lockedList;
  await new Promise((resolve,reject) => {setTimeout(() => {resolve()}, 500)});
  if(!boardState.saved) {
    if(confirm("Your annotations are not saved, are you sure you want to continue?")) {
      socket.emit("getLockedList", null);
      socket.on('acceptLockedList', function(lockedListAns){
        lockedList = lockedListAns;
      });
      boardState.imageID = undefined;
      clearCanvases();
      await initialize();
      const request = new XMLHttpRequest();
      request.open('GET', `/main/loadSet/${imageSetID}`, true);
      request.onreadystatechange = () => {
        if(request.readyState === 4 && request.status === 200) {
          boardStateHistory.reset();
          boardState = boardStateConstructor.initializeNewBoardState(boardConfigDraw);
          imageSlider.initialize();
          imageSlider.closeLoad();
          imageSlider.loadSetIntoSlider(JSON.parse(request.response), document);
          boardState.imageSetID = imageSetID;
          imageSlider.lockImages(lockedList);
          imageSlider.addEventListeners();
        }
      }
      request.send();
    }
  } else {
      socket.emit("getLockedList", null);
      socket.on('acceptLockedList', function(lockedListAns){
        lockedList = lockedListAns;
      });
      boardState.imageID = undefined;
      clearCanvases();
      await initialize();
      const request = new XMLHttpRequest();
      request.open('GET', `/main/loadSet/${imageSetID}`, true);
      request.onreadystatechange = () => {
        if(request.readyState === 4 && request.status === 200) {
          boardStateHistory.reset();
          boardState = boardStateConstructor.initializeNewBoardState(boardConfigDraw);
          imageSlider.initialize();
          imageSlider.closeLoad();
          imageSlider.loadSetIntoSlider(JSON.parse(request.response), document);
          boardState.imageSetID = imageSetID;
          imageSlider.lockImages(lockedList);
          imageSlider.addEventListeners();
        }
      }
      request.send();
  }
}

function saveBoardStateToDB() {
  if(boardState.imageID) {
    const loadDIV = document.getElementsByClassName("waitForSave")[0];
    loadDIV.classList.add("display");
    const rescaledPolygons = poly.getRescaledPolygons(boardState.currentPolygonCollection, boardState.boardConfig.shrinkage);
    const finishedPolygons = rescaledPolygons.polygons.filter(polygon => polygon.finished);
    const request = new XMLHttpRequest();
    request.open('POST', `/main/saveAnnotations/${boardState.imageSetID}/${boardState.imageID}`, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = () => {
      if(request.readyState === 4 && request.status === 200) {
        boardState.save();
        loadDIV.classList.remove("display");
        document.querySelector("button#save svg").style.fill = "#2ECC40";
        setTimeout(() => {document.querySelector("button#save svg").style.fill = "#000";}, 2000);
      } else {
        document.querySelector("button#save svg").style.fill = "#FF4136";
        setTimeout(() => {document.querySelector("button#save svg").style.fill = "#000";}, 2000);
      }
    }
    request.send(JSON.stringify(finishedPolygons));
    return;
  }
}

function addEventListeners() {

  document.getElementById("navbarMenu").addEventListener("click", (evt) => {
    document.getElementsByClassName("navbar-menu")[0].classList.toggle("open");
  }, false);

  // SAVE BOARD
  document.querySelector("button#save").addEventListener("click", (evt) => {
    if(boardState.imageID){
      saveBoardStateToDB();
    }
  }, false);

  document.getElementById("loadImageSet").addEventListener("click", async (evt) => {
    document.getElementsByClassName("loadScreen")[0].classList.add("cover");
    await imageSlider.loadSets();
  }, false);
  try {
    document.getElementById("uploadImageSet").addEventListener("click", (evt) => {
      document.getElementsByClassName("uploadScreen")[0].classList.add("cover");
    }, false);
  } catch(error) {}

  document.getElementById("uploadForImageSet").addEventListener("change", (evt) => {
    imageSlider.handleFileUpload(document.querySelector("#uploadForImageSet").files);
  }, false);

  // prevent default undo/redo bei inputs
  Array.from(document.getElementsByTagName("input")).forEach((input) => {
    input.addEventListener("keydown", function(evt){
      if (evt.ctrlKey && ((evt.key === 'z' || evt.key === 'Z') || (evt.key === 'y' || evt.key === 'Y'))) {
        evt.preventDefault();
      }
    });
  });

  document.addEventListener("keydown", function(evt) {
    if(evt.altKey) editor.expand();
    if(evt.keyCode == 27) {
      if(document.querySelector(".uploadScreen.cover")) {
        imageSlider.closeUpload();
        imageSlider.clearUploadForm();
        return;
      } else if(document.querySelector(".loadScreen.cover")) {
        imageSlider.closeLoad();
        return;
      }
      editor.collapse();
    }
    if(evt.shiftKey) {
      document.getElementById("drawBoard").classList.remove("crosshair");
      document.getElementById("drawBoard").className = "shift-pressed";
    }

    if(evt.ctrlKey && evt.key=="y" || evt.key == "Y") {
      boardState = boardStateHistory.redoBoardState(editor) || boardState;
      editor.populateOptionList();
      drawer.reDrawBoardState(boardState);
    }
    else if(evt.ctrlKey && evt.key=="z" || evt.key=="Z") {
      boardState = boardStateHistory.undoBoardState(editor) || boardState;
      editor.populateOptionList();
      drawer.reDrawBoardState(boardState);
    }
  }, false);

  document.addEventListener("keyup", function(evt){
    if(!evt.shiftKey) {
      document.getElementById("drawBoard").classList.remove("shift-pressed");
      document.getElementById("drawBoard").className = "crosshair";
    }
  }, false);

  const controls = Array.from(document.querySelectorAll(".shapes button"));
  controls.forEach((control) => {
    control.addEventListener("click", function(evt){
      if(!control.classList.contains("active")) control.classList.add("active");
      controls.forEach((otherControl) => {
        if(otherControl !== control && otherControl.classList.contains("active")) otherControl.classList.remove("active");
      })
    }, false);
  });

  document.getElementById("undo").addEventListener("click", function(evt){
    boardState = boardStateHistory.undoBoardState(editor) || boardState;
    editor.populateOptionList();
    drawer.reDrawBoardState(boardState);
  }, false);

  document.getElementById("redo").addEventListener("click", function(evt){
    boardState = boardStateHistory.redoBoardState(editor) || boardState;
    editor.populateOptionList();
    drawer.reDrawBoardState(boardState);
  }, false);

  document.getElementById("clear").addEventListener("click", function(evt){
    reset();
  }, false);

  document.getElementById("lines").addEventListener("click", function(evt) {
    drawDevice = "Lines";
  }, false);

  document.getElementById("rectangle").addEventListener("click", function(evt) {
    drawDevice = "Rectangle";
  }, false);

  document.getElementById("triangle").addEventListener("click", function(evt) {
    drawDevice = "Triangle";
  }, false);

  document.getElementById("alertClose").addEventListener("click", function(evt){
    document.getElementsByClassName("alert-box")[0].classList.remove("showAndfadeOut");
  }, false);

  document.getElementById("toggleEditor").addEventListener("click", function(evt){
    editor.toggle();
  }, false);

  document.getElementById("attributeInput").addEventListener("keyup", function(evt){
    if(evt.keyCode === 13) { //enter
      const attribute = new poly.Attribute(this.value);
      if(editor.addAttributeToFocusedPolygon(attribute)) editor.displayAttribute(attribute);
      this.value= "";
      boardStateHistory.copyBoardStateToHistory(boardState, true, editor.getCurrentlyFocusedPolygon());
    }
  }, false);

  document.getElementsByClassName("deletePolygon")[0].addEventListener("click", function(evt){
    const currentPolygon = editor.getCurrentlyFocusedPolygon();
    if(!currentPolygon) return customAlert("Select a Polygon to delete please!");
    boardState.currentPolygonCollection.removePolygon(currentPolygon.ID);
    editor.populateOptionList();
    boardStateHistory.copyBoardStateToHistory(boardState);
    drawer.reDrawBoardState(boardState);
  }, false);
}

function addCanvasEventListeners() {
  boardState.boardConfig.canvas.addEventListener("click", function(evt){
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    let {X, Y} = getTranslatedMousePosition(evt)
    if(checkIfInPic(X, Y) && !evt.shiftKey){
      if((evt.which === 1 || evt.button === 0) && drawDevice === "Lines") {
        if(evt.ctrlKey){
          handleFinishPoint();
        } else {
          handlePoint(X, Y);
        }
      }
    }
    return;
  }, false);

  boardState.boardConfig.canvas.addEventListener('mousedown',function(evt){
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    let {X, Y} = getTranslatedMousePosition(evt)
    dragStart = {X, Y};
    if(!evt.shiftKey && checkIfInPic(X, Y)) {
      drawStart = {X, Y};
      currentlyDrawing = true;
      const {X: startX, Y: startY} = dragStart;

      if(drawDevice === "Rectangle") {
        startRectangle(startX, startY);
      } else if(drawDevice === "Triangle") {
        startTriangle(startX, startY);
      }
    }
  }, false);

  boardState.boardConfig.canvas.addEventListener('mousemove',function(evt){
    let {X, Y} = getTranslatedMousePosition(evt)
    if(evt.altKey) {
      const hoveredPolygons = getHoveredPolygons(X, Y);
      if(hoveredPolygons.polygons.length >= 1) editor.bringOptionInFocus(editor.getOptionDIVByPolygonID(hoveredPolygons.polygons[0].ID));
    }
    if (dragStart && evt.shiftKey && !currentlyDrawing){

      handleDrag(dragStart, X, Y);

    } else if (drawStart) {

      //const {X: imageX, Y: imageY} = viewState.getTransformedPoint(imageWidth*boardState.boardConfig.shrinkage, imageHeight*boardState.boardConfig.shrinkage);
      const imageXmax = imageWidth*boardState.boardConfig.shrinkage;
      const imageYmax = imageHeight*boardState.boardConfig.shrinkage;
      X = (X > imageXmax) ? imageXmax : X;
      Y = (Y > imageYmax) ? imageYmax : Y;
      X = (X < 0) ? 0 : X;
      Y = (Y < 0) ? 0 : Y;
      if(drawDevice === "Rectangle") {
        drawDynamicRectangle(X, Y);
      } else if(drawDevice === "Triangle") {
        drawDynamicTriangle(X, Y);
      }
    }
  },false);

  boardState.boardConfig.canvas.addEventListener("mouseup", function(evt){
    if (drawStart && !evt.shiftKey) {

      if(drawDevice === "Rectangle") {
        finishRectangle();
      } else if(drawDevice === "Triangle") {
        finishTriangle();
      }

    }
    drawStart = undefined;
    dragStart = undefined;
    currentlyDrawing = false;
  }, false);

  boardState.boardConfig.canvas.addEventListener("mouseover", function(evt){
  }, false);

  boardState.boardConfig.canvas.addEventListener("mouseout", function(evt){
  }, false);

  boardState.boardConfig.canvas.addEventListener('DOMMouseScroll', function(evt) {
    supportedZoomMode = true;
    const delta = handleScroll(evt);
    if (delta) {
      let {X, Y} = getTranslatedMousePosition(evt)
      viewState.zoom(delta, X, Y);
      drawer.scaleThicknessOnZoom(Math.pow(viewState.scaleFactor,delta));
      viewState.zoomImage(delta, X, Y, boardConfigImage);
    };
    drawer.clearAndDrawImage(img, boardConfigImage, imageWidth, imageHeight); 
    drawer.reDrawBoardState(boardState);
  },false);

  boardState.boardConfig.canvas.addEventListener('mousewheel', function(evt){
    if(!supportedZoomMode) {
      const delta = handleScroll(evt);
      if (delta) {
        let {X, Y} = getTranslatedMousePosition(evt)
        viewState.zoom(delta, X, Y);
        drawer.scaleThicknessOnZoom(Math.pow(viewState.scaleFactor,delta));
        viewState.zoomImage(delta, X, Y, boardConfigImage);
      };
      drawer.clearAndDrawImage(img, boardConfigImage, imageWidth, imageHeight); 
      drawer.reDrawBoardState(boardState);
    }
  },false);
}

function initializeDrawingCanvas() {
  boardConfigDraw = new boardStateConstructor.BoardConfig(document.getElementById("drawBoard"), document);
  boardConfigDraw.setContext();
  boardConfigDraw.canvas.width = boardConfigImage.canvas.width;
  boardConfigDraw.canvas.height = boardConfigImage.canvas.height;
  boardConfigDraw.shrinkage = boardConfigImage.shrinkage;
  boardConfigDraw.ctx.clearRect(0, 0, boardConfigDraw.canvas.width, boardConfigDraw.canvas.height);
}

function initializeCanvases(imagePath) {
  return new Promise((resolve, reject) => {
    img = new Image();
    if(imagePath) {
      img.addEventListener("load", function () {
        imageWidth = img.width;
        imageHeight = img.height;
        boardConfigImage.resizeCanvasToFit(img);
  
        initializeDrawingCanvas();
        resolve();
      });
      img.src = imagePath;
    } else {
      initializeDrawingCanvas();
      resolve();
    }
  });
}

async function initialize(imagePath, imageID) {
  boardConfigImage = new boardStateConstructor.BoardConfig(document.getElementById("imageBoard"), document); //zuerst mit dem image canvas
  boardConfigImage.setContext();
  boardStateHistory = new boardStateConstructor.BoardStateHistory();

  await initializeCanvases(imagePath);
  let serverBoardState; 
  if(imageID) {
    serverBoardState = await getBoardIfAnnotated(imageID);
  }
  if(!serverBoardState) boardState = boardStateConstructor.initializeNewBoardState(boardConfigDraw);
  else {
    boardState = serverBoardState;
    boardState.boardConfig = boardConfigDraw;
  }
  viewState = new viewStateConstructor.ViewState(boardConfigDraw); //hier also dann boardConfigDraw
  boardStateHistory.copyBoardStateToHistory(boardState);
  drawer = new drawerConsturctor.Drawer(boardState, boardConfigDraw, viewState);
  drawer.drawImage(img, boardConfigImage);
  if(serverBoardState) {
    drawer.reDrawBoardState(boardState);
  }
  boardState.save();

  if(firstTime){
    firstTime = false;
    editor = new editorConstructor.Editor();
    editor.initialize();
    addEventListeners();
    addCanvasEventListeners();
  }
  editor.populateOptionList();
}

if(document.URL.startsWith(window.location.origin+"/main")) {
  document.addEventListener("DOMContentLoaded",function(){
    socket = io.connect();
    imageSlider = new imageSliderConstructor.ImageSlider(document);
  
    const cookie = document.cookie.split(';');
    cookie.forEach((cookie) => {
      if(cookie.split("=")[0].trim() === "newUser") {
        customAlert("Your account was successfully created. Enjoy using the app!");
        document.cookie = "newUser=;expires=Thu, 01 Jan 1970 00:00:01 GMT;"; //delete the cookie
      }
    });  
    initialize();
  });
}
else login.initialize();

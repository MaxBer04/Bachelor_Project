"use strict";

export let IDList = [];
export let IDListAttributes = [];

export function getRescaledPolygons(polygonCollection, shrinkage) {
  const rescaledPolygons = _.cloneDeep(polygonCollection);
  const polygons = rescaledPolygons.polygons;
  for(let i = 0; i< polygons.length; i++) {
    for(let k = 0; k < polygons[i].points.length; k++) {
      polygons[i].points[k].X = Math.round(polygons[i].points[k].X*1/shrinkage);
      polygons[i].points[k].Y = Math.round(polygons[i].points[k].Y*1/shrinkage);
    }
  }
  return rescaledPolygons;
}

export function getBackscaledPolygons(polygonCollection, shrinkage) {
  const rescaledPolygons = _.cloneDeep(polygonCollection);
  const polygons = rescaledPolygons.polygons;
  for(let i = 0; i< polygons.length; i++) {
    for(let k = 0; k < polygons[i].points.length; k++) {
      polygons[i].points[k].X = Math.round(polygons[i].points[k].X*shrinkage);
      polygons[i].points[k].Y = Math.round(polygons[i].points[k].Y*shrinkage);
    }
  }
  return rescaledPolygons;
}
export class Polygon {
  constructor(points = [], finished = false, fillColor, shape = "", text = "", name ="") {
    this._points = points;
    this._finished = finished;
    this._fillColor = fillColor;
    this._useColor = fillColor ? this.RGBAtoRGB(fillColor) : "";
    this._shape = shape;
    this._ID = this.getNewID();
    this._attributeList = [];
    this._text = text;
    this._name = name;
    this._selectedInEditor = false;
  }
  get points() { return this._points; }
  set points(points) { this._points = points; }

  get name() { return this._name; }
  set name(name) { this._name = name; }

  get selectedInEditor() { return this._selectedInEditor; }
  set selectedInEditor(bool) { this._selectedInEditor = bool; }

  get finished() { return this._finished; }
  set finished(finished) { 
    if( typeof finished !== "boolean") {
      alert("Finished has to be a boolean!");
      return;
    }
    this._finished = finished; 
  }

  RGBAtoRGB(color) {
    return color.replace(/[\d\.]+\)$/g, ')').replace(",)", ")");
  }

  get fillColor() { return this._fillColor; }
  set fillColor(color) { 
    this._fillColor = color;
    this._useColor = this.RGBAtoRGB(color);
  }

  get shape() { return this._shape; }
  set shape(shape) { this._shape = shape; }

  get ID() { return this._ID; }

  getNewID() {
    let ID = 1
    while(IDList.includes(ID)) ID = Math.round(Math.random()*1000);
    IDList.push(ID);
    return ID;
  }

  set attributes(attributes) { this._attributeList = attributes; }

  addAttribute(attribute) {
    this._attributeList.push(attribute);
  }

  hasAttribute(attributeText) {
    for(let i = 0; i < this._attributeList.length; i++) {
      const result = this._attributeList[i].content.localeCompare(attributeText) === 0 ? true : false;
      if(result) return true;
    };
    return false;
  }

  removeAttribute(ID) {
    for(let i = 0; i < this._attributeList.length; i++) {
      if(this._attributeList[i].ID === ID) {
        this._attributeList.splice(i, 1);
        return;
      }
    }
  }

  get attributes() { return this._attributeList; }
  getAttribute(ID) {
    this._attributeList.forEach((attribute) => {
      if(attribute.ID === ID) return attribute;
    });
    return;
  }

  updateAttribute(index, newContent) {
    this._attributeList[index].content = newContent;
  }

  set text(text) { this._text = text; }
  get text() { return this._text; }

  addPoint(point) {
    this._points.push(point);
  }

  addPoints(points) {
    for(let i = 0; i < points.length; i++) {
      this._points.push(points[i]);
    }
  }

  replacePoint(index, newPoint) {
    this._points[index] = newPoint;
  }

}

export class Attribute {
  constructor(content) {
    this._content = content;
    this._preSaveContent = "";
    this._ID = this.getNewID();
  }

  get preSaveContent() { return this._preSaveContent; }
  set preSaveContent(content) { this._preSaveContent = content; }

  get content() { return this._content; }
  set content(content) { this._content = content; }

  get ID() { return this._ID; }
  getNewID() {
    let ID = 1
    while(IDListAttributes.includes(ID)) ID = Math.round(Math.random()*10000);
    IDListAttributes.push(ID);
    return ID;
  }
}

// kann mit einem polygon oder einem Array von Polygonen instanziiert werden
export class PolygonCollection {
  constructor(polygons = []) {
    this._polygons = polygons;
  }

  get polygons() { return this._polygons; }
  set polygons(polygons) { this._polygons = polygons; }

  addPolygon(polygon) {
    this._polygons.push(polygon);
  }

  removePolygon(ID) {
    for(let i = 0; i < this._polygons.length; i++) {
      if(this._polygons[i].ID === ID) {
        this._polygons.splice(i, 1);
        break;
      }
    }
  }
}



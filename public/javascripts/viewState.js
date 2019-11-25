export class ViewState {
  constructor(boardConfig, scaleFactor = 1.05) {
    this._boardConfig = boardConfig;
    this._scaleFactor = scaleFactor;

    detectTransforms(boardConfig.ctx);
  }

  get scaleFactor() { return this._scaleFactor; }
  set scaleFactor(scaleFactor) { this._scaleFactor = scaleFactor; }

  zoom(delta, X, Y){
    //this._boardConfig.ctx.save();
    //this._boardConfig.ctx.transform(1/delta, 0, 0, 1/delta, 0, 0);
    this._boardConfig.ctx.translate(X, Y);
    var factor = Math.pow(this._scaleFactor,delta);
    this._boardConfig.ctx.scale(factor,factor);
    this._boardConfig.ctx.translate(-X, -Y);
  }

  zoomImage(delta, X, Y, boardConfigImage){
    var factor = Math.pow(this._scaleFactor,delta);
    boardConfigImage.ctx.scale(factor,factor);
  }

  getTransformedPoint(Xval, Yval) {
    let point = this._boardConfig.ctx.transformedPoint(Xval, Yval);
    const X = point.x;
    const Y = point.y;
    return {X, Y};
  }

  translate(startX, startY, X, Y) {
    this._boardConfig.ctx.translate(X-startX,Y-startY);
  }
}


// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function detectTransforms(ctx){
  var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
  var xform = svg.createSVGMatrix();
  ctx.getTransform = function(){ return xform; };


  var savedTransforms = [];
  var save = ctx.save;
  ctx.save = function(){
    savedTransforms.push(xform.translate(0,0));
    return save.call(ctx);
  };

  var restore = ctx.restore;
  ctx.restore = function(){
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  var scale = ctx.scale;
  ctx.scale = function(sx,sy){
    xform = xform.scaleNonUniform(sx,sy);
    return scale.call(ctx,sx,sy);
  };

  var translate = ctx.translate;
  ctx.translate = function(dx,dy){
    xform = xform.translate(dx,dy);
    return translate.call(ctx,dx,dy);
  };

  var transform = ctx.transform;
  ctx.transform = function(a,b,c,d,e,f){
    var m2 = svg.createSVGMatrix();
    m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
    xform = xform.multiply(m2);
    return transform.call(ctx,a,b,c,d,e,f);
  };

  var setTransform = ctx.setTransform;
  ctx.setTransform = function(a,b,c,d,e,f){
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx,a,b,c,d,e,f);
  };

  var pt  = svg.createSVGPoint();
  ctx.transformedPoint = function(x,y){
    pt.x=x; pt.y=y;
    return pt.matrixTransform(xform.inverse());
  }
}
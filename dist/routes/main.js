"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _login = require("./login.js");

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var _multer = _interopRequireDefault(require("multer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var storage = _multer["default"].diskStorage({
  destination: function destination(req, res, cb) {
    cb(null, './uploads');
  }
});

var upload = (0, _multer["default"])({
  storage: storage
});

var router = _express["default"].Router();

var dbHandler = new _databaseHandler["default"]();
router.get('/', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res, next) {
    var user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getCookieWithIsAdmin(req.cookies);

          case 2:
            user = _context.sent;
            res.render('main', user, function (err, html) {
              res.send(html);
            });

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
router.get("/loadAnnotations/:imageID", _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var imageID, boardState, i;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            imageID = req.params.imageID;
            boardState = {};
            _context2.next = 4;
            return dbHandler.isImageAnnotatedByUser(req.cookies.ID, imageID);

          case 4:
            if (!_context2.sent) {
              _context2.next = 19;
              break;
            }

            _context2.next = 7;
            return dbHandler.getAnnotationsFromImage(req.cookies.ID, imageID);

          case 7:
            boardState.polygonCollection = _context2.sent;
            i = 0;

          case 9:
            if (!(i < boardState.polygonCollection.length)) {
              _context2.next = 19;
              break;
            }

            _context2.next = 12;
            return dbHandler.getAttributesFromAnnotation(boardState.polygonCollection[i].ID);

          case 12:
            boardState.polygonCollection[i].attributes = _context2.sent;
            _context2.next = 15;
            return dbHandler.getPointsFromAnnotation(boardState.polygonCollection[i].ID);

          case 15:
            boardState.polygonCollection[i].points = _context2.sent;

          case 16:
            i++;
            _context2.next = 9;
            break;

          case 19:
            res.json(boardState);

          case 20:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/loadSet/:imageSetID', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(req, res) {
    var imageSetID, images, i;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            imageSetID = req.params.imageSetID;
            _context3.next = 3;
            return dbHandler.getImageIDAndPathFromSet(imageSetID);

          case 3:
            images = _context3.sent;
            i = 0;

          case 5:
            if (!(i < images.length)) {
              _context3.next = 13;
              break;
            }

            _context3.next = 8;
            return dbHandler.isImageAnnotatedByUser(req.cookies.ID, images[i].ID);

          case 8:
            if (!_context3.sent) {
              _context3.next = 10;
              break;
            }

            images[i].annotated = true;

          case 10:
            i++;
            _context3.next = 5;
            break;

          case 13:
            res.json(images);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}());
router.post('/saveAnnotations/:imageSetID/:imageID', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(req, res) {
    var imageSetID, imageID, rescaledPolygons;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            imageSetID = req.params.imageSetID;
            imageID = req.params.imageID;
            rescaledPolygons = req.body;
            _context4.prev = 3;

            if (!(rescaledPolygons.length > 0)) {
              _context4.next = 14;
              break;
            }

            _context4.next = 7;
            return dbHandler.isImageSetAnnotated(req.cookies.ID, imageSetID);

          case 7:
            if (_context4.sent) {
              _context4.next = 10;
              break;
            }

            _context4.next = 10;
            return dbHandler.markImageSetAsAnnotated(req.cookies.ID, imageSetID);

          case 10:
            _context4.next = 12;
            return saveAnnotations(req.cookies.ID, imageID, rescaledPolygons);

          case 12:
            _context4.next = 23;
            break;

          case 14:
            _context4.next = 16;
            return deleteAllAnnotations(req.cookies.ID, imageID);

          case 16:
            _context4.next = 18;
            return dbHandler.isImageSetAnnotated(req.cookies.ID, imageSetID);

          case 18:
            if (!_context4.sent) {
              _context4.next = 23;
              break;
            }

            _context4.next = 21;
            return dbHandler.removeImageSetAsAnnotated(req.cookies.ID, imageSetID);

          case 21:
            _context4.next = 23;
            return dbHandler.removeImageAsAnnotated(req.cookies.ID, imageID);

          case 23:
            res.status(200).send();
            _context4.next = 30;
            break;

          case 26:
            _context4.prev = 26;
            _context4.t0 = _context4["catch"](3);
            console.error(_context4.t0);
            res.status(500).send(_context4.t0);

          case 30:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 26]]);
  }));

  return function (_x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}());

function saveAnnotations(_x10, _x11, _x12) {
  return _saveAnnotations.apply(this, arguments);
}

function _saveAnnotations() {
  _saveAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(userID, imageID, rescaledPolygons) {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return dbHandler.isImageAnnotatedByUser(userID, imageID);

          case 2:
            if (!_context7.sent) {
              _context7.next = 7;
              break;
            }

            _context7.next = 5;
            return deleteAllAnnotations(userID, imageID);

          case 5:
            _context7.next = 9;
            break;

          case 7:
            _context7.next = 9;
            return dbHandler.newAnnotationByUser(userID, imageID);

          case 9:
            _context7.next = 11;
            return addNewAnnotations(userID, imageID, rescaledPolygons);

          case 11:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _saveAnnotations.apply(this, arguments);
}

function deleteAllAnnotations(_x13, _x14) {
  return _deleteAllAnnotations.apply(this, arguments);
}

function _deleteAllAnnotations() {
  _deleteAllAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(userID, imageID) {
    var annotations, m;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return dbHandler.getAnnotationIDs(userID, imageID);

          case 2:
            annotations = _context8.sent;
            _context8.next = 5;
            return dbHandler.deleteAllAnnotationsForImage(userID, imageID);

          case 5:
            m = 0;

          case 6:
            if (!(m < annotations.length)) {
              _context8.next = 14;
              break;
            }

            _context8.next = 9;
            return dbHandler.deletePoints(annotations[m].ID);

          case 9:
            _context8.next = 11;
            return dbHandler.deleteAttributes(annotations[m].ID);

          case 11:
            m++;
            _context8.next = 6;
            break;

          case 14:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _deleteAllAnnotations.apply(this, arguments);
}

function addNewAnnotations(_x15, _x16, _x17) {
  return _addNewAnnotations.apply(this, arguments);
}

function _addNewAnnotations() {
  _addNewAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9(userID, imageID, rescaledPolygons) {
    var i, annotationID, k, x;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < rescaledPolygons.length)) {
              _context9.next = 22;
              break;
            }

            _context9.next = 4;
            return dbHandler.addAnnotationToImage(imageID, rescaledPolygons[i]);

          case 4:
            annotationID = _context9.sent;
            k = 0;

          case 6:
            if (!(k < rescaledPolygons[i]._points.length)) {
              _context9.next = 12;
              break;
            }

            _context9.next = 9;
            return dbHandler.addPointToAnnotation(annotationID, rescaledPolygons[i]._points[k]);

          case 9:
            k++;
            _context9.next = 6;
            break;

          case 12:
            x = 0;

          case 13:
            if (!(x < rescaledPolygons[i]._attributeList.length)) {
              _context9.next = 19;
              break;
            }

            _context9.next = 16;
            return dbHandler.addAttributeToAnnotation(annotationID, rescaledPolygons[i]._attributeList[x]);

          case 16:
            x++;
            _context9.next = 13;
            break;

          case 19:
            i++;
            _context9.next = 1;
            break;

          case 22:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _addNewAnnotations.apply(this, arguments);
}

router.post('/uploadSet', _login.verifyToken, _login.isAdmin, upload.array('images'),
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(req, res) {
    var imageSetID, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, fileURL;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(req.files.length === 0)) {
              _context5.next = 4;
              break;
            }

            return _context5.abrupt("return", res.status(400).send('No files were uploaded.'));

          case 4:
            _context5.prev = 4;
            _context5.next = 7;
            return dbHandler.createNewImageSet(req.body.title);

          case 7:
            imageSetID = _context5.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context5.prev = 11;
            _iterator = req.files[Symbol.iterator]();

          case 13:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context5.next = 21;
              break;
            }

            file = _step.value;
            fileURL = "/uploads/" + file.filename;
            _context5.next = 18;
            return dbHandler.addImageToImageSet(fileURL, imageSetID, file.mimetype);

          case 18:
            _iteratorNormalCompletion = true;
            _context5.next = 13;
            break;

          case 21:
            _context5.next = 27;
            break;

          case 23:
            _context5.prev = 23;
            _context5.t0 = _context5["catch"](11);
            _didIteratorError = true;
            _iteratorError = _context5.t0;

          case 27:
            _context5.prev = 27;
            _context5.prev = 28;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 30:
            _context5.prev = 30;

            if (!_didIteratorError) {
              _context5.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context5.finish(30);

          case 34:
            return _context5.finish(27);

          case 35:
            _context5.next = 41;
            break;

          case 37:
            _context5.prev = 37;
            _context5.t1 = _context5["catch"](4);
            console.log(_context5.t1);
            res.status(500).send(_context5.t1);

          case 41:
            res.status(200).send();

          case 42:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[4, 37], [11, 23, 27, 35], [28,, 30, 34]]);
  }));

  return function (_x18, _x19) {
    return _ref5.apply(this, arguments);
  };
}());
router.get('/loadSetPreviews', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(req, res) {
    var imageSets, loadedSetIDs, answerSets, i, images, title, k, answer;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return dbHandler.getAllImageSets();

          case 3:
            imageSets = _context6.sent;
            loadedSetIDs = req.header("loadedSetIDs").split(",").map(function (number) {
              return Number(number);
            });
            answerSets = [];
            i = 0;

          case 7:
            if (!(i < imageSets.length)) {
              _context6.next = 24;
              break;
            }

            if (!loadedSetIDs.includes(imageSets[i].ID)) {
              _context6.next = 10;
              break;
            }

            return _context6.abrupt("continue", 21);

          case 10:
            ;
            _context6.next = 13;
            return dbHandler.getImagePathAndTypFromSet(imageSets[i].ID);

          case 13:
            images = _context6.sent;
            _context6.next = 16;
            return dbHandler.getImageSetTitle(imageSets[i].ID);

          case 16:
            title = _context6.sent.title;
            imageSets[i].images = [];

            for (k = 0; k < 3 && images.length; k++) {
              imageSets[i].images.push({
                path: images[k].path,
                type: images[k].type
              });
            }

            imageSets[i].title = title;
            answerSets.push(imageSets[i]);

          case 21:
            i++;
            _context6.next = 7;
            break;

          case 24:
            answer = {
              sets: answerSets
            };
            res.json(answer);
            _context6.next = 32;
            break;

          case 28:
            _context6.prev = 28;
            _context6.t0 = _context6["catch"](0);
            console.log(_context6.t0);
            res.status(500).send();

          case 32:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 28]]);
  }));

  return function (_x20, _x21) {
    return _ref6.apply(this, arguments);
  };
}());

function getCookieWithIsAdmin(_x22) {
  return _getCookieWithIsAdmin.apply(this, arguments);
}

function _getCookieWithIsAdmin() {
  _getCookieWithIsAdmin = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee10(cookies) {
    var isAdmin;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return dbHandler.isAdmin(cookies.ID);

          case 2:
            isAdmin = _context10.sent;
            return _context10.abrupt("return", {
              email: cookies.email,
              token: cookies.token,
              ID: cookies.ID,
              firstName: cookies.firstName,
              lastName: cookies.lastName,
              isAdmin: isAdmin
            });

          case 4:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _getCookieWithIsAdmin.apply(this, arguments);
}

var _default = router;
exports["default"] = _default;
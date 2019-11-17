"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _login = require("./login.js");

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var _multer = _interopRequireDefault(require("multer"));

var _atob = _interopRequireDefault(require("atob"));

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
    var verified, user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return dbHandler.isVerified(req.user.ID);

          case 2:
            verified = _context.sent;
            //const user = await getCookieWithIsAdmin(req.cookies);
            user = req.user;
            user.verified = verified;
            res.render('main', user, function (err, html) {
              res.send(html);
            });

          case 6:
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
router.get('/users', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var users;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return dbHandler.getAllUsers();

          case 2:
            users = _context2.sent;
            res.json(users);

          case 4:
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
router.get('/attributes', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(req, res) {
    var attributes;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return dbHandler.getAllAttributes();

          case 2:
            attributes = _context3.sent;
            res.json(attributes);

          case 4:
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
router.get('/attributes/text', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(req, res) {
    var attributes;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return dbHandler.getAllAttributesText();

          case 2:
            attributes = _context4.sent;
            res.json(attributes);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}());
router.get("/annotations/:imageID/:userID", _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(req, res) {
    var imageID, boardState, userIDForAnnotation, i;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            imageID = req.params.imageID;
            boardState = {};
            userIDForAnnotation = req.user.ID;

            if (req.params.userID != 'undefined') {
              userIDForAnnotation = req.params.userID;
            }

            _context5.next = 6;
            return dbHandler.isImageAnnotatedByUser(userIDForAnnotation, imageID);

          case 6:
            if (!_context5.sent) {
              _context5.next = 21;
              break;
            }

            _context5.next = 9;
            return dbHandler.getAnnotationsFromImage(userIDForAnnotation, imageID);

          case 9:
            boardState.polygonCollection = _context5.sent;
            i = 0;

          case 11:
            if (!(i < boardState.polygonCollection.length)) {
              _context5.next = 21;
              break;
            }

            _context5.next = 14;
            return dbHandler.getAttributesFromAnnotation(boardState.polygonCollection[i].ID);

          case 14:
            boardState.polygonCollection[i].attributes = _context5.sent;
            _context5.next = 17;
            return dbHandler.getPointsFromAnnotation(boardState.polygonCollection[i].ID);

          case 17:
            boardState.polygonCollection[i].points = _context5.sent;

          case 18:
            i++;
            _context5.next = 11;
            break;

          case 21:
            res.json(boardState);

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x10, _x11) {
    return _ref5.apply(this, arguments);
  };
}());
router.get("/users/annotated/:annotationID/", _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(req, res) {
    var annotationID, userObject;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            annotationID = req.params.annotationID;
            _context6.next = 3;
            return dbHandler.getUserIDFromAnnotationID(annotationID);

          case 3:
            userObject = _context6.sent;
            res.json(userObject);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x12, _x13) {
    return _ref6.apply(this, arguments);
  };
}());
router.get("/users/all/annotated/:imageID/", _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(req, res) {
    var imageID, userIDs, i;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            imageID = req.params.imageID;
            _context7.next = 3;
            return dbHandler.getAllUserIDsForAnnotatedImage(imageID);

          case 3:
            userIDs = _context7.sent;
            i = 0;

          case 5:
            if (!(i < userIDs.length)) {
              _context7.next = 12;
              break;
            }

            _context7.next = 8;
            return dbHandler.getEmailByID(userIDs[i].userID);

          case 8:
            userIDs[i].email = _context7.sent;

          case 9:
            i++;
            _context7.next = 5;
            break;

          case 12:
            res.json(userIDs);

          case 13:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x14, _x15) {
    return _ref7.apply(this, arguments);
  };
}());
router.get('/sets', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(req, res) {
    var sets;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return dbHandler.getAllImageSets();

          case 2:
            sets = _context8.sent;
            res.json(sets);

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}());
router.post('/sets', _login.verifyToken, _login.isAdmin, upload.array('images'),
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9(req, res) {
    var imageSetID, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, fileURL;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!(req.files.length === 0)) {
              _context9.next = 4;
              break;
            }

            return _context9.abrupt("return", res.status(400).send('No files were uploaded.'));

          case 4:
            _context9.prev = 4;
            _context9.next = 7;
            return dbHandler.createNewImageSet(req.body.title);

          case 7:
            imageSetID = _context9.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context9.prev = 11;
            _iterator = req.files[Symbol.iterator]();

          case 13:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context9.next = 21;
              break;
            }

            file = _step.value;
            fileURL = "/uploads/" + file.filename;
            _context9.next = 18;
            return dbHandler.addImageToImageSet(fileURL, imageSetID, file.mimetype);

          case 18:
            _iteratorNormalCompletion = true;
            _context9.next = 13;
            break;

          case 21:
            _context9.next = 27;
            break;

          case 23:
            _context9.prev = 23;
            _context9.t0 = _context9["catch"](11);
            _didIteratorError = true;
            _iteratorError = _context9.t0;

          case 27:
            _context9.prev = 27;
            _context9.prev = 28;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 30:
            _context9.prev = 30;

            if (!_didIteratorError) {
              _context9.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context9.finish(30);

          case 34:
            return _context9.finish(27);

          case 35:
            _context9.next = 41;
            break;

          case 37:
            _context9.prev = 37;
            _context9.t1 = _context9["catch"](4);
            console.error(_context9.t1);
            res.status(500).send(_context9.t1);

          case 41:
            res.status(200).send();

          case 42:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[4, 37], [11, 23, 27, 35], [28,, 30, 34]]);
  }));

  return function (_x18, _x19) {
    return _ref9.apply(this, arguments);
  };
}());
router.post('/sets/multiple', _login.verifyToken, _login.isAdmin, upload.array('images'),
/*#__PURE__*/
function () {
  var _ref10 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee10(req, res) {
    var files, setNamesAndImages, i, pathParts, folderName, imgObj, setName, setID;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            files = req.files;
            setNamesAndImages = {};
            console.log(files[0]);

            for (i = 0; i < files.length; i++) {
              pathParts = (0, _atob["default"])(files[i].originalname).split("/");
              folderName = void 0;
              if (pathParts.length === 3) folderName = pathParts[1];else folderName = pathParts[0];
              imgObj = {
                path: "/uploads/" + files[i].filename,
                type: files[i].mimetype
              };

              if (setNamesAndImages.hasOwnProperty(folderName)) {
                setNamesAndImages[folderName].push(imgObj);
              } else {
                setNamesAndImages[folderName] = [imgObj];
              }
            }

            _context10.t0 = regeneratorRuntime.keys(setNamesAndImages);

          case 6:
            if ((_context10.t1 = _context10.t0()).done) {
              _context10.next = 15;
              break;
            }

            setName = _context10.t1.value;
            _context10.next = 10;
            return dbHandler.createNewImageSet(setName);

          case 10:
            setID = _context10.sent;
            _context10.next = 13;
            return dbHandler.addImagesToImageSet(setID, setNamesAndImages[setName]);

          case 13:
            _context10.next = 6;
            break;

          case 15:
            _context10.next = 21;
            break;

          case 17:
            _context10.prev = 17;
            _context10.t2 = _context10["catch"](0);
            console.error(_context10.t2);
            res.status(500).send(_context10.t2);

          case 21:
            res.status(200).send();

          case 22:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 17]]);
  }));

  return function (_x20, _x21) {
    return _ref10.apply(this, arguments);
  };
}());
router.get('/setPreviews', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref11 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee11(req, res) {
    var imageSets, loadedSetIDs, answerSets, i, images, title, k, answer;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _context11.next = 3;
            return dbHandler.getAllImageSetIDs();

          case 3:
            imageSets = _context11.sent;
            loadedSetIDs = req.header("loadedSetIDs").split(",").map(function (number) {
              return Number(number);
            });
            answerSets = [];
            i = 0;

          case 7:
            if (!(i < imageSets.length)) {
              _context11.next = 24;
              break;
            }

            if (!loadedSetIDs.includes(imageSets[i].ID)) {
              _context11.next = 10;
              break;
            }

            return _context11.abrupt("continue", 21);

          case 10:
            ;
            _context11.next = 13;
            return dbHandler.getImagePathAndTypFromSet(imageSets[i].ID);

          case 13:
            images = _context11.sent;
            _context11.next = 16;
            return dbHandler.getImageSetTitle(imageSets[i].ID);

          case 16:
            title = _context11.sent.title;
            imageSets[i].images = [];

            for (k = 0; k < 3 && k < images.length; k++) {
              imageSets[i].images.push({
                path: images[k].path,
                type: images[k].type
              });
            }

            imageSets[i].title = title;
            answerSets.push(imageSets[i]);

          case 21:
            i++;
            _context11.next = 7;
            break;

          case 24:
            answer = {
              sets: answerSets
            };
            res.json(answer);
            _context11.next = 32;
            break;

          case 28:
            _context11.prev = 28;
            _context11.t0 = _context11["catch"](0);
            console.error(_context11.t0);
            res.status(500).send();

          case 32:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[0, 28]]);
  }));

  return function (_x22, _x23) {
    return _ref11.apply(this, arguments);
  };
}());
router.get('/sets/:imageSetID', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref12 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee12(req, res) {
    var imageSetID, images, i;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            imageSetID = req.params.imageSetID;
            _context12.next = 3;
            return dbHandler.getImageIDAndPathFromSet(imageSetID);

          case 3:
            images = _context12.sent;
            i = 0;

          case 5:
            if (!(i < images.length)) {
              _context12.next = 13;
              break;
            }

            _context12.next = 8;
            return dbHandler.isImageAnnotatedByUser(req.user.ID, images[i].ID);

          case 8:
            if (!_context12.sent) {
              _context12.next = 10;
              break;
            }

            images[i].annotated = true;

          case 10:
            i++;
            _context12.next = 5;
            break;

          case 13:
            res.json(images);

          case 14:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function (_x24, _x25) {
    return _ref12.apply(this, arguments);
  };
}());
router.post('/annotations/:imageSetID/:imageID', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref13 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee13(req, res) {
    var imageSetID, imageID, userID, rescaledPolygons, currentDateISO, imageSetAnnotated, imageAnnotated;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            imageSetID = req.params.imageSetID;
            imageID = req.params.imageID;
            userID = req.user.ID;
            rescaledPolygons = req.body;
            currentDateISO = new Date().toISOString();
            _context13.next = 7;
            return dbHandler.isImageSetAnnotated(userID, imageSetID);

          case 7:
            imageSetAnnotated = _context13.sent;
            _context13.next = 10;
            return dbHandler.isImageAnnotatedByUser(userID, imageID);

          case 10:
            imageAnnotated = _context13.sent;
            _context13.prev = 11;

            if (!(rescaledPolygons.length > 0)) {
              _context13.next = 33;
              break;
            }

            if (imageSetAnnotated) {
              _context13.next = 18;
              break;
            }

            _context13.next = 16;
            return dbHandler.markImageSetAsAnnotated(userID, imageSetID);

          case 16:
            _context13.next = 20;
            break;

          case 18:
            _context13.next = 20;
            return dbHandler.updateAnnotationTimestampForImageSet(imageSetID, userID, currentDateISO);

          case 20:
            if (!imageAnnotated) {
              _context13.next = 27;
              break;
            }

            _context13.next = 23;
            return saveAnnotations(userID, imageID, rescaledPolygons);

          case 23:
            _context13.next = 25;
            return dbHandler.updateAnnotationTimestampForImage(imageID, userID, currentDateISO);

          case 25:
            _context13.next = 31;
            break;

          case 27:
            _context13.next = 29;
            return addNewAnnotations(userID, imageID, rescaledPolygons);

          case 29:
            _context13.next = 31;
            return dbHandler.markImageAsAnnotated(userID, imageID);

          case 31:
            _context13.next = 41;
            break;

          case 33:
            if (!imageSetAnnotated) {
              _context13.next = 36;
              break;
            }

            _context13.next = 36;
            return dbHandler.removeImageSetAsAnnotated(userID, imageSetID);

          case 36:
            if (!imageAnnotated) {
              _context13.next = 41;
              break;
            }

            _context13.next = 39;
            return dbHandler.removeImageAsAnnotated(userID, imageID);

          case 39:
            _context13.next = 41;
            return deleteAllAnnotations(userID, imageID);

          case 41:
            res.status(200).send();
            _context13.next = 48;
            break;

          case 44:
            _context13.prev = 44;
            _context13.t0 = _context13["catch"](11);
            console.error(_context13.t0);
            res.status(500).send(_context13.t0);

          case 48:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[11, 44]]);
  }));

  return function (_x26, _x27) {
    return _ref13.apply(this, arguments);
  };
}());

function saveAnnotations(_x28, _x29, _x30) {
  return _saveAnnotations.apply(this, arguments);
}

function _saveAnnotations() {
  _saveAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee14(userID, imageID, rescaledPolygons) {
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return deleteAllAnnotations(userID, imageID);

          case 2:
            _context14.next = 4;
            return addNewAnnotations(userID, imageID, rescaledPolygons);

          case 4:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _saveAnnotations.apply(this, arguments);
}

function deleteAllAnnotations(_x31, _x32) {
  return _deleteAllAnnotations.apply(this, arguments);
}

function _deleteAllAnnotations() {
  _deleteAllAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee15(userID, imageID) {
    var annotations, m;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return dbHandler.getAnnotationIDs(userID, imageID);

          case 2:
            annotations = _context15.sent;
            _context15.next = 5;
            return dbHandler.deleteAllAnnotationsForImage(userID, imageID);

          case 5:
            m = 0;

          case 6:
            if (!(m < annotations.length)) {
              _context15.next = 14;
              break;
            }

            _context15.next = 9;
            return dbHandler.deletePoints(annotations[m].ID);

          case 9:
            _context15.next = 11;
            return dbHandler.deleteAttributes(annotations[m].ID);

          case 11:
            m++;
            _context15.next = 6;
            break;

          case 14:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _deleteAllAnnotations.apply(this, arguments);
}

function addNewAnnotations(_x33, _x34, _x35) {
  return _addNewAnnotations.apply(this, arguments);
}

function _addNewAnnotations() {
  _addNewAnnotations = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee16(userID, imageID, rescaledPolygons) {
    var i, annotationID;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < rescaledPolygons.length)) {
              _context16.next = 12;
              break;
            }

            _context16.next = 4;
            return dbHandler.addAnnotationToImage(imageID, userID, rescaledPolygons[i]);

          case 4:
            annotationID = _context16.sent;
            _context16.next = 7;
            return dbHandler.addPointsToAnnotation(annotationID, rescaledPolygons[i]._points);

          case 7:
            _context16.next = 9;
            return dbHandler.addAttributesToAnnotation(annotationID, rescaledPolygons[i]._attributeList);

          case 9:
            i++;
            _context16.next = 1;
            break;

          case 12:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _addNewAnnotations.apply(this, arguments);
}

var _default = router;
exports["default"] = _default;
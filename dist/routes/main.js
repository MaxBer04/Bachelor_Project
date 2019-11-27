"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _express = _interopRequireDefault(require("express"));

var _login = require("./login.js");

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var _app = require("../app.js");

var _multer = _interopRequireDefault(require("multer"));

var _atob = _interopRequireDefault(require("atob"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var storage = _multer["default"].diskStorage({
  destination: function destination(req, res, cb) {
    cb(null, './uploads');
  }
});

var upload = (0, _multer["default"])({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

var router = _express["default"].Router();

var dbHandler = new _databaseHandler["default"]();
router.get('/', _login.verifyToken, function _callee(req, res, next) {
  var verified, user;
  return _regenerator["default"].async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator["default"].awrap(dbHandler.isVerified(req.user.ID));

        case 2:
          verified = _context.sent;
          //const user = await getCookieWithIsAdmin(req.cookies);
          console.log(req.user);
          user = req.user;
          user.verified = verified;
          res.render('main', user, function (err, html) {
            res.send(html);
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/users', _login.verifyToken, function _callee2(req, res) {
  var users;
  return _regenerator["default"].async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAllUsers());

        case 2:
          users = _context2.sent;
          res.json(users);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.get('/attributes', _login.verifyToken, function _callee3(req, res) {
  var attributes;
  return _regenerator["default"].async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAllAttributes());

        case 2:
          attributes = _context3.sent;
          res.json(attributes);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.get('/attributes/text/:firstChar', _login.verifyToken, function _callee4(req, res) {
  var attributes, filteredAttributes;
  return _regenerator["default"].async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAllAttributesText());

        case 2:
          attributes = _context4.sent;
          filteredAttributes = attributes.filter(function (attribute) {
            return attribute.text.startsWith(req.params.firstChar);
          });
          console.log(filteredAttributes);
          res.json(filteredAttributes);

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.get("/annotations/:imageID/:userID", _login.verifyToken, function _callee5(req, res) {
  var imageID, boardState, userIDForAnnotation, i;
  return _regenerator["default"].async(function _callee5$(_context5) {
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
          return _regenerator["default"].awrap(dbHandler.isImageAnnotatedByUser(userIDForAnnotation, imageID));

        case 6:
          if (!_context5.sent) {
            _context5.next = 21;
            break;
          }

          _context5.next = 9;
          return _regenerator["default"].awrap(dbHandler.getAnnotationsFromImage(userIDForAnnotation, imageID));

        case 9:
          boardState.polygonCollection = _context5.sent;
          i = 0;

        case 11:
          if (!(i < boardState.polygonCollection.length)) {
            _context5.next = 21;
            break;
          }

          _context5.next = 14;
          return _regenerator["default"].awrap(dbHandler.getAttributesFromAnnotation(boardState.polygonCollection[i].ID));

        case 14:
          boardState.polygonCollection[i].attributes = _context5.sent;
          _context5.next = 17;
          return _regenerator["default"].awrap(dbHandler.getPointsFromAnnotation(boardState.polygonCollection[i].ID));

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
  });
});
router.get("/admins/contactEmails", _login.verifyToken, function _callee6(req, res) {
  var contactEmails, i;
  return _regenerator["default"].async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return _regenerator["default"].awrap(dbHandler.getContactEmails());

        case 2:
          contactEmails = _context6.sent;
          i = 0;

        case 4:
          if (!(i < contactEmails.length)) {
            _context6.next = 12;
            break;
          }

          if (contactEmails[i].contactMail) {
            _context6.next = 9;
            break;
          }

          _context6.next = 8;
          return _regenerator["default"].awrap(dbHandler.getEmailByID(contactEmails[i].userID));

        case 8:
          contactEmails[i].contactMail = _context6.sent;

        case 9:
          i++;
          _context6.next = 4;
          break;

        case 12:
          ;
          res.json(contactEmails);

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.post("/admins/contactEmails/:newContactMail", _login.verifyToken, function _callee7(req, res) {
  return _regenerator["default"].async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          console.log(req.params.newContactMail);
          _context7.next = 3;
          return _regenerator["default"].awrap(dbHandler.updateAdminContactMail(req.user.ID, req.params.newContactMail));

        case 3:
          res.status(200).send();

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  });
});
router.get("/users/annotated/:annotationID/", _login.verifyToken, function _callee8(req, res) {
  var annotationID, userObject;
  return _regenerator["default"].async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          annotationID = req.params.annotationID;
          _context8.next = 3;
          return _regenerator["default"].awrap(dbHandler.getUserIDFromAnnotationID(annotationID));

        case 3:
          userObject = _context8.sent;
          res.json(userObject);

        case 5:
        case "end":
          return _context8.stop();
      }
    }
  });
});
router.get("/users/all/annotated/:imageID/", _login.verifyToken, function _callee9(req, res) {
  var imageID, userIDs, i;
  return _regenerator["default"].async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          imageID = req.params.imageID;
          _context9.next = 3;
          return _regenerator["default"].awrap(dbHandler.getAllUserIDsForAnnotatedImage(imageID));

        case 3:
          userIDs = _context9.sent;
          i = 0;

        case 5:
          if (!(i < userIDs.length)) {
            _context9.next = 12;
            break;
          }

          _context9.next = 8;
          return _regenerator["default"].awrap(dbHandler.getEmailByID(userIDs[i].userID));

        case 8:
          userIDs[i].email = _context9.sent;

        case 9:
          i++;
          _context9.next = 5;
          break;

        case 12:
          res.json(userIDs);

        case 13:
        case "end":
          return _context9.stop();
      }
    }
  });
});
router.get('/sets', _login.verifyToken, function _callee10(req, res) {
  var sets;
  return _regenerator["default"].async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAllImageSets());

        case 2:
          sets = _context10.sent;
          res.json(sets);

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  });
});
router.post('/sets', _login.verifyToken, _login.isAdmin, upload.array('images'), function _callee11(req, res) {
  var imageSetID, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, fileURL;

  return _regenerator["default"].async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          if (!(req.files.length === 0)) {
            _context11.next = 4;
            break;
          }

          return _context11.abrupt("return", res.status(400).send('No files were uploaded.'));

        case 4:
          _context11.prev = 4;
          _context11.next = 7;
          return _regenerator["default"].awrap(dbHandler.createNewImageSet(req.body.title));

        case 7:
          imageSetID = _context11.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context11.prev = 11;
          _iterator = req.files[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context11.next = 21;
            break;
          }

          file = _step.value;
          fileURL = "/uploads/" + file.filename;
          _context11.next = 18;
          return _regenerator["default"].awrap(dbHandler.addImageToImageSet(fileURL, imageSetID, file.mimetype));

        case 18:
          _iteratorNormalCompletion = true;
          _context11.next = 13;
          break;

        case 21:
          _context11.next = 27;
          break;

        case 23:
          _context11.prev = 23;
          _context11.t0 = _context11["catch"](11);
          _didIteratorError = true;
          _iteratorError = _context11.t0;

        case 27:
          _context11.prev = 27;
          _context11.prev = 28;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 30:
          _context11.prev = 30;

          if (!_didIteratorError) {
            _context11.next = 33;
            break;
          }

          throw _iteratorError;

        case 33:
          return _context11.finish(30);

        case 34:
          return _context11.finish(27);

        case 35:
          _context11.next = 41;
          break;

        case 37:
          _context11.prev = 37;
          _context11.t1 = _context11["catch"](4);
          console.error(_context11.t1);
          res.status(500).send(_context11.t1);

        case 41:
          res.status(200).send();

        case 42:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[4, 37], [11, 23, 27, 35], [28,, 30, 34]]);
});

var busboy = require('connect-busboy');

router.use(busboy({
  highWaterMark: 2 * 1048 * 1048
}));
router.post('/sets/multiple2', _login.verifyToken, _login.isAdmin, function _callee12(req, res) {
  return _regenerator["default"].async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          req.pipe(req.busboy);
          req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Upload of '".concat(filename, "' started")); // Create a write stream of the new file

            var fstream = _fs["default"].createWriteStream(_path["default"].join(_path["default"].join(__dirname, '../../uploads'), filename)); // Pipe it trough


            file.pipe(fstream); // On finish of the upload

            fstream.on('close', function () {
              console.log("Upload of '".concat(filename, "' finished"));
            });
          });
          req.busboy.on('finish', function () {
            res.status(200).send();
          });

        case 3:
        case "end":
          return _context12.stop();
      }
    }
  });
});
router.post('/sets/multiple', _login.verifyToken, _login.isAdmin, upload.array('images'), function _callee13(req, res) {
  var files, socket, setNamesAndImages, i, pathParts, folderName, imgObj, x, setCount, setName, setID;
  return _regenerator["default"].async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          files = req.files;
          socket = (0, _app.getUploadSocket)();
          console.log("HIER");
          setNamesAndImages = {};

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

          socket.emit("uploadStateUpdate", 'Saving to database...');
          console.log("HIER");
          x = 1;
          setCount = Object.keys(setNamesAndImages).length;
          _context13.t0 = _regenerator["default"].keys(setNamesAndImages);

        case 11:
          if ((_context13.t1 = _context13.t0()).done) {
            _context13.next = 22;
            break;
          }

          setName = _context13.t1.value;
          socket.emit("uploadStateUpdate", "Saving to database... \n      <br> Saving Set ".concat(x, " from ").concat(setCount, " \n      <br> Set name: ").concat(setName));
          _context13.next = 16;
          return _regenerator["default"].awrap(dbHandler.createNewImageSet(setName));

        case 16:
          setID = _context13.sent;
          _context13.next = 19;
          return _regenerator["default"].awrap(dbHandler.addImagesToImageSet(setID, setNamesAndImages[setName]));

        case 19:
          x++;
          _context13.next = 11;
          break;

        case 22:
          socket.emit("uploadStateUpdate", 'finished');
          _context13.next = 29;
          break;

        case 25:
          _context13.prev = 25;
          _context13.t2 = _context13["catch"](0);
          console.error(_context13.t2);
          res.status(500).send(_context13.t2);

        case 29:
          res.status(200).send();

        case 30:
        case "end":
          return _context13.stop();
      }
    }
  }, null, null, [[0, 25]]);
});
router.get('/setPreviews', _login.verifyToken, function _callee14(req, res) {
  var imageSets, loadedSetIDs, answerSets, i, images, title, k, answer;
  return _regenerator["default"].async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          _context14.next = 3;
          return _regenerator["default"].awrap(dbHandler.getAllImageSetIDs());

        case 3:
          imageSets = _context14.sent;
          loadedSetIDs = req.header("loadedSetIDs").split(",").map(function (number) {
            return Number(number);
          });
          answerSets = [];
          i = 0;

        case 7:
          if (!(i < imageSets.length)) {
            _context14.next = 24;
            break;
          }

          if (!loadedSetIDs.includes(imageSets[i].ID)) {
            _context14.next = 10;
            break;
          }

          return _context14.abrupt("continue", 21);

        case 10:
          ;
          _context14.next = 13;
          return _regenerator["default"].awrap(dbHandler.getImagePathAndTypFromSet(imageSets[i].ID));

        case 13:
          images = _context14.sent;
          _context14.next = 16;
          return _regenerator["default"].awrap(dbHandler.getImageSetTitle(imageSets[i].ID));

        case 16:
          title = _context14.sent.title;
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
          _context14.next = 7;
          break;

        case 24:
          answer = {
            sets: answerSets
          };
          res.json(answer);
          _context14.next = 32;
          break;

        case 28:
          _context14.prev = 28;
          _context14.t0 = _context14["catch"](0);
          console.error(_context14.t0);
          res.status(500).send();

        case 32:
        case "end":
          return _context14.stop();
      }
    }
  }, null, null, [[0, 28]]);
});
router.get('/sets/:imageSetID', _login.verifyToken, function _callee15(req, res) {
  var imageSetID, images, i;
  return _regenerator["default"].async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          imageSetID = req.params.imageSetID;
          _context15.next = 3;
          return _regenerator["default"].awrap(dbHandler.getImageIDAndPathFromSet(imageSetID));

        case 3:
          images = _context15.sent;
          i = 0;

        case 5:
          if (!(i < images.length)) {
            _context15.next = 13;
            break;
          }

          _context15.next = 8;
          return _regenerator["default"].awrap(dbHandler.isImageAnnotatedByUser(req.user.ID, images[i].ID));

        case 8:
          if (!_context15.sent) {
            _context15.next = 10;
            break;
          }

          images[i].annotated = true;

        case 10:
          i++;
          _context15.next = 5;
          break;

        case 13:
          res.json(images);

        case 14:
        case "end":
          return _context15.stop();
      }
    }
  });
});
router.post('/annotations/:imageSetID/:imageID', _login.verifyToken, function _callee16(req, res) {
  var imageSetID, imageID, userID, rescaledPolygons, currentDateISO, imageSetAnnotated, imageAnnotated;
  return _regenerator["default"].async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          imageSetID = req.params.imageSetID;
          imageID = req.params.imageID;
          userID = req.user.ID;
          rescaledPolygons = req.body;
          currentDateISO = new Date().toISOString();
          _context16.next = 7;
          return _regenerator["default"].awrap(dbHandler.isImageSetAnnotated(userID, imageSetID));

        case 7:
          imageSetAnnotated = _context16.sent;
          _context16.next = 10;
          return _regenerator["default"].awrap(dbHandler.isImageAnnotatedByUser(userID, imageID));

        case 10:
          imageAnnotated = _context16.sent;
          _context16.prev = 11;

          if (!(rescaledPolygons.length > 0)) {
            _context16.next = 33;
            break;
          }

          if (imageSetAnnotated) {
            _context16.next = 18;
            break;
          }

          _context16.next = 16;
          return _regenerator["default"].awrap(dbHandler.markImageSetAsAnnotated(userID, imageSetID));

        case 16:
          _context16.next = 20;
          break;

        case 18:
          _context16.next = 20;
          return _regenerator["default"].awrap(dbHandler.updateAnnotationTimestampForImageSet(imageSetID, userID, currentDateISO));

        case 20:
          if (!imageAnnotated) {
            _context16.next = 27;
            break;
          }

          _context16.next = 23;
          return _regenerator["default"].awrap(saveAnnotations(userID, imageID, rescaledPolygons));

        case 23:
          _context16.next = 25;
          return _regenerator["default"].awrap(dbHandler.updateAnnotationTimestampForImage(imageID, userID, currentDateISO));

        case 25:
          _context16.next = 31;
          break;

        case 27:
          _context16.next = 29;
          return _regenerator["default"].awrap(addNewAnnotations(userID, imageID, rescaledPolygons));

        case 29:
          _context16.next = 31;
          return _regenerator["default"].awrap(dbHandler.markImageAsAnnotated(userID, imageID));

        case 31:
          _context16.next = 41;
          break;

        case 33:
          if (!imageSetAnnotated) {
            _context16.next = 36;
            break;
          }

          _context16.next = 36;
          return _regenerator["default"].awrap(dbHandler.removeImageSetAsAnnotated(userID, imageSetID));

        case 36:
          if (!imageAnnotated) {
            _context16.next = 41;
            break;
          }

          _context16.next = 39;
          return _regenerator["default"].awrap(dbHandler.removeImageAsAnnotated(userID, imageID));

        case 39:
          _context16.next = 41;
          return _regenerator["default"].awrap(deleteAllAnnotations(userID, imageID));

        case 41:
          res.status(200).send();
          _context16.next = 48;
          break;

        case 44:
          _context16.prev = 44;
          _context16.t0 = _context16["catch"](11);
          console.error(_context16.t0);
          res.status(500).send(_context16.t0);

        case 48:
        case "end":
          return _context16.stop();
      }
    }
  }, null, null, [[11, 44]]);
});

function saveAnnotations(userID, imageID, rescaledPolygons) {
  return _regenerator["default"].async(function saveAnnotations$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _context17.next = 2;
          return _regenerator["default"].awrap(deleteAllAnnotations(userID, imageID));

        case 2:
          _context17.next = 4;
          return _regenerator["default"].awrap(addNewAnnotations(userID, imageID, rescaledPolygons));

        case 4:
        case "end":
          return _context17.stop();
      }
    }
  });
}

function deleteAllAnnotations(userID, imageID) {
  var annotations, m;
  return _regenerator["default"].async(function deleteAllAnnotations$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          _context18.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAnnotationIDs(userID, imageID));

        case 2:
          annotations = _context18.sent;
          _context18.next = 5;
          return _regenerator["default"].awrap(dbHandler.deleteAllAnnotationsForImage(userID, imageID));

        case 5:
          m = 0;

        case 6:
          if (!(m < annotations.length)) {
            _context18.next = 14;
            break;
          }

          _context18.next = 9;
          return _regenerator["default"].awrap(dbHandler.deletePoints(annotations[m].ID));

        case 9:
          _context18.next = 11;
          return _regenerator["default"].awrap(dbHandler.deleteAttributes(annotations[m].ID));

        case 11:
          m++;
          _context18.next = 6;
          break;

        case 14:
        case "end":
          return _context18.stop();
      }
    }
  });
}

function addNewAnnotations(userID, imageID, rescaledPolygons) {
  var i, annotationID;
  return _regenerator["default"].async(function addNewAnnotations$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < rescaledPolygons.length)) {
            _context19.next = 12;
            break;
          }

          _context19.next = 4;
          return _regenerator["default"].awrap(dbHandler.addAnnotationToImage(imageID, userID, rescaledPolygons[i]));

        case 4:
          annotationID = _context19.sent;
          _context19.next = 7;
          return _regenerator["default"].awrap(dbHandler.addPointsToAnnotation(annotationID, rescaledPolygons[i]._points));

        case 7:
          _context19.next = 9;
          return _regenerator["default"].awrap(dbHandler.addAttributesToAnnotation(annotationID, rescaledPolygons[i]._attributeList));

        case 9:
          i++;
          _context19.next = 1;
          break;

        case 12:
        case "end":
          return _context19.stop();
      }
    }
  });
}

var _default = router;
exports["default"] = _default;
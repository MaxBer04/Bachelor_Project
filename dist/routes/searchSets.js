"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _login = require("./login.js");

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

router.get('/', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            res.render('search', function (err, html) {
              res.send(html);
            });

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get('/confirmed', _login.verifyToken,
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var dbHandler, searchResults3, searchResults, searchResults2, usersArray, userID, i, k;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // Bei den Modes bedeutet false OR und true AND
            dbHandler = new _databaseHandler["default"]();

            if (!(!req.query.users & !req.query.sets & !req.query.attributes)) {
              _context2.next = 7;
              break;
            }

            _context2.next = 4;
            return searchAllAnnotatedSets(dbHandler);

          case 4:
            searchResults3 = _context2.sent;
            _context2.next = 16;
            break;

          case 7:
            _context2.next = 9;
            return searchByUserEmails(req.query, dbHandler);

          case 9:
            searchResults = _context2.sent;
            _context2.next = 12;
            return searchBySets(req.query, searchResults, dbHandler);

          case 12:
            searchResults2 = _context2.sent;
            _context2.next = 15;
            return searchByAttributes(req.query, searchResults2, dbHandler);

          case 15:
            searchResults3 = _context2.sent;

          case 16:
            // Für die User View noch das Annotationsdatum für jedes Bild laden
            usersArray = Array.isArray(req.query.users) ? req.query.users : [req.query.users];

            if (!(usersArray.length === 1 && usersArray[0])) {
              _context2.next = 34;
              break;
            }

            _context2.next = 20;
            return dbHandler.getIDByEmail(usersArray[0]);

          case 20:
            userID = _context2.sent;
            i = 0;

          case 22:
            if (!(i < searchResults3.length)) {
              _context2.next = 34;
              break;
            }

            k = 0;

          case 24:
            if (!(k < searchResults3[i].annotatedImages.length)) {
              _context2.next = 31;
              break;
            }

            _context2.next = 27;
            return dbHandler.getAnnotationDateForImage(searchResults3[i].annotatedImages[k].ID, userID);

          case 27:
            searchResults3[i].annotatedImages[k].lastAnnotationDate = _context2.sent.timestamp;

          case 28:
            k++;
            _context2.next = 24;
            break;

          case 31:
            i++;
            _context2.next = 22;
            break;

          case 34:
            res.json(searchResults3);
            dbHandler.close();

          case 36:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

function searchAllAnnotatedSets(_x5) {
  return _searchAllAnnotatedSets.apply(this, arguments);
}

function _searchAllAnnotatedSets() {
  _searchAllAnnotatedSets = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(dbHandler) {
    var annotatedSets, i;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return dbHandler.getAllAnnotatedSets();

          case 2:
            annotatedSets = _context3.sent;
            i = 0;

          case 4:
            if (!(i < annotatedSets.length)) {
              _context3.next = 11;
              break;
            }

            _context3.next = 7;
            return dbHandler.getAnnotatedImagesFromSet(annotatedSets[i].ID);

          case 7:
            annotatedSets[i].annotatedImages = _context3.sent;

          case 8:
            i++;
            _context3.next = 4;
            break;

          case 11:
            return _context3.abrupt("return", annotatedSets);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _searchAllAnnotatedSets.apply(this, arguments);
}

function searchByUserEmails(_x6, _x7) {
  return _searchByUserEmails.apply(this, arguments);
}

function _searchByUserEmails() {
  _searchByUserEmails = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(reqQuery, dbHandler) {
    var searchResults, mode, users;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!reqQuery.users) {
              _context4.next = 8;
              break;
            }

            mode = reqQuery.userMode === 'true' ? 'AND' : 'OR';
            users = reqQuery.users;
            if (!Array.isArray(users)) users = [users];
            _context4.next = 6;
            return dbHandler.getSetsByUserAnnotations(users, mode);

          case 6:
            searchResults = _context4.sent;
            removeDuplicates(searchResults);

          case 8:
            return _context4.abrupt("return", searchResults);

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _searchByUserEmails.apply(this, arguments);
}

function removeDuplicates(setList) {
  setList = setList.filter(function (set, index, self) {
    return index === self.findIndex(function (foundSet) {
      foundSet.ID === set.ID;
    });
  });
}

function searchBySets(_x8, _x9, _x10) {
  return _searchBySets.apply(this, arguments);
}

function _searchBySets() {
  _searchBySets = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(reqQuery, userSearchResults, dbHandler) {
    var searchResults2, sets, i, k, userMode, userEmails, _i, l, image;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            searchResults2 = userSearchResults;

            if (!reqQuery.sets) {
              _context6.next = 12;
              break;
            }

            searchResults2 = [];
            sets = reqQuery.sets;
            if (!Array.isArray(reqQuery.sets)) sets = [reqQuery.sets];

            if (!userSearchResults) {
              _context6.next = 9;
              break;
            }

            for (i = 0; i < sets.length; i++) {
              for (k = 0; k < userSearchResults.length; k++) {
                if (Number(userSearchResults[k].ID) === Number(sets[i])) {
                  searchResults2.push(userSearchResults[k]);
                }
              }
            }

            _context6.next = 12;
            break;

          case 9:
            _context6.next = 11;
            return dbHandler.getSetsByID(sets);

          case 11:
            searchResults2 = _context6.sent;

          case 12:
            if (!searchResults2) {
              _context6.next = 37;
              break;
            }

            userMode = reqQuery.userMode === 'true' ? 'AND' : 'OR';
            userEmails = reqQuery.users;
            if (!Array.isArray(userEmails)) userEmails = [userEmails];
            _i = 0;

          case 17:
            if (!(_i < searchResults2.length)) {
              _context6.next = 37;
              break;
            }

            if (!userEmails[0]) {
              _context6.next = 22;
              break;
            }

            return _context6.delegateYield(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee5() {
              var userIDs, l, image, _k, annotations;

              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return dbHandler.getIDsFromEmails(userEmails);

                    case 2:
                      userIDs = _context5.sent;
                      userIDs.forEach(function (IDobj, index) {
                        userIDs[index] = IDobj.ID;
                      });
                      _context5.next = 6;
                      return dbHandler.getAnnotatedImagesFromUsers(userIDs, searchResults2[_i].ID, userMode);

                    case 6:
                      searchResults2[_i].annotatedImages = _context5.sent;
                      l = 0;

                    case 8:
                      if (!(l < searchResults2[_i].annotatedImages.length)) {
                        _context5.next = 26;
                        break;
                      }

                      image = searchResults2[_i].annotatedImages[l];
                      image.annotations = [];
                      _k = 0;

                    case 12:
                      if (!(_k < userIDs.length)) {
                        _context5.next = 23;
                        break;
                      }

                      _context5.next = 15;
                      return dbHandler.getAnnotationsFromImage(userIDs[_k], image.ID);

                    case 15:
                      annotations = _context5.sent;
                      _context5.next = 18;
                      return dbHandler.isImageAnnotatedByUser(userIDs[_k], image.ID);

                    case 18:
                      if (!_context5.sent) {
                        _context5.next = 20;
                        break;
                      }

                      image.annotations = image.annotations.concat(annotations);

                    case 20:
                      _k++;
                      _context5.next = 12;
                      break;

                    case 23:
                      l++;
                      _context5.next = 8;
                      break;

                    case 26:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5);
            })(), "t0", 20);

          case 20:
            _context6.next = 34;
            break;

          case 22:
            _context6.next = 24;
            return dbHandler.getAnnotatedImagesFromSet(searchResults2[_i].ID);

          case 24:
            searchResults2[_i].annotatedImages = _context6.sent;
            l = 0;

          case 26:
            if (!(l < searchResults2[_i].annotatedImages.length)) {
              _context6.next = 34;
              break;
            }

            image = searchResults2[_i].annotatedImages[l];
            _context6.next = 30;
            return dbHandler.getAllAnnotationsFromImage(image.ID);

          case 30:
            image.annotations = _context6.sent;

          case 31:
            l++;
            _context6.next = 26;
            break;

          case 34:
            _i++;
            _context6.next = 17;
            break;

          case 37:
            return _context6.abrupt("return", searchResults2);

          case 38:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _searchBySets.apply(this, arguments);
}

function searchByAttributes(_x11, _x12, _x13) {
  return _searchByAttributes.apply(this, arguments);
}

function _searchByAttributes() {
  _searchByAttributes = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(reqQuery, setsSearchResults, dbHandler) {
    var mode, attributes, k, m, l, currentAnnotation, _k2, _m, _loop, _l, _ret;

    return regeneratorRuntime.wrap(function _callee8$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!reqQuery.attributes) {
              _context11.next = 34;
              break;
            }

            mode = reqQuery.attributesMode === 'true' ? 'AND' : 'OR';
            attributes = reqQuery.attributes;
            if (!Array.isArray(reqQuery.attributes)) attributes = [reqQuery.attributes];

            if (!setsSearchResults) {
              _context11.next = 28;
              break;
            }

            k = 0;

          case 6:
            if (!(k < setsSearchResults.length)) {
              _context11.next = 24;
              break;
            }

            m = 0;

          case 8:
            if (!(m < setsSearchResults[k].annotatedImages.length)) {
              _context11.next = 21;
              break;
            }

            l = 0;

          case 10:
            if (!(l < setsSearchResults[k].annotatedImages[m].annotations.length)) {
              _context11.next = 18;
              break;
            }

            currentAnnotation = setsSearchResults[k].annotatedImages[m].annotations[l];
            _context11.next = 14;
            return dbHandler.getAttributesFromAnnotation(currentAnnotation.ID);

          case 14:
            currentAnnotation.attributes = _context11.sent;

          case 15:
            l++;
            _context11.next = 10;
            break;

          case 18:
            m++;
            _context11.next = 8;
            break;

          case 21:
            k++;
            _context11.next = 6;
            break;

          case 24:
            // Nach Attributen Filtern
            for (_k2 = setsSearchResults.length - 1; _k2 >= 0; _k2--) {
              for (_m = setsSearchResults[_k2].annotatedImages.length - 1; _m >= 0; _m--) {
                _loop = function _loop(_l) {
                  var currentAnnotation = setsSearchResults[_k2].annotatedImages[_m].annotations[_l];
                  var temporaryAttributes = [].concat(attributes);
                  currentAnnotation.attributes.forEach(function (attribute) {
                    for (var y = temporaryAttributes.length - 1; y >= 0; y--) {
                      if (attribute.text === temporaryAttributes[y]) temporaryAttributes.splice(y, 1);
                    }
                  });

                  if (mode === 'AND') {
                    // Checken, ob noch Attribute im temporären Array sind, wenn ja kommen diese in den Annotationen des Bilds nicht vor => Bild entfernen
                    if (temporaryAttributes.length > 0) setsSearchResults[_k2].annotatedImages[_m].annotations.splice(_l, 1);
                  } else {
                    // Checken, ob mindestens ein Attribut entfernt wurde, wenn nicht, Bild entfernen
                    if (temporaryAttributes.length === attributes.length) setsSearchResults[_k2].annotatedImages[_m].annotations.splice(_l, 1);
                  }
                };

                for (_l = setsSearchResults[_k2].annotatedImages[_m].annotations.length - 1; _l >= 0; _l--) {
                  _loop(_l);
                } // Checken, ob ein Bild keine Annotationen mehr hat, also die Suchkriterien nicht erfüllt => entfernen


                if (setsSearchResults[_k2].annotatedImages[_m].annotations.length === 0) setsSearchResults[_k2].annotatedImages.splice(_m, 1);
              } // Checken, ob ein Set keine Bilder mehr enthält, also die Suchkriterien nicht erfüllt => entfernen


              if (setsSearchResults[_k2].annotatedImages.length === 0) setsSearchResults.splice(_k2, 1);
            }

            return _context11.abrupt("return", setsSearchResults);

          case 28:
            return _context11.delegateYield(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee7() {
              var searchResults3, matchedAnnotationIDs, annotationIDs, _loop2, i, allAnnotationIDs, annotationObjects, images, _loop3, _k3, _loop4, y;

              return regeneratorRuntime.wrap(function _callee7$(_context10) {
                while (1) {
                  switch (_context10.prev = _context10.next) {
                    case 0:
                      searchResults3 = [];
                      // Get IDs für Annotationen zu den Attributen
                      annotationIDs = [];
                      _loop2 =
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _loop2(i) {
                        var parsedAnnotationIDs;
                        return regeneratorRuntime.wrap(function _loop2$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                _context7.next = 2;
                                return dbHandler.getAnnotationIDsByText(attributes[i]);

                              case 2:
                                parsedAnnotationIDs = _context7.sent;
                                parsedAnnotationIDs.forEach(function (IDobj, index) {
                                  parsedAnnotationIDs[index] = IDobj.annotationID;
                                });
                                annotationIDs.push(parsedAnnotationIDs);

                              case 5:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        }, _loop2);
                      });
                      i = 0;

                    case 4:
                      if (!(i < attributes.length)) {
                        _context10.next = 9;
                        break;
                      }

                      return _context10.delegateYield(_loop2(i), "t0", 6);

                    case 6:
                      i++;
                      _context10.next = 4;
                      break;

                    case 9:
                      if (mode === 'AND') {
                        // match annotationIDs
                        matchedAnnotationIDs = annotationIDs.shift().filter(function (e1) {
                          return annotationIDs.every(function (e2) {
                            return e2.indexOf(e1) !== -1;
                          });
                        });
                      } else {
                        allAnnotationIDs = [].concat.apply([], annotationIDs);
                        matchedAnnotationIDs = _toConsumableArray(new Set(allAnnotationIDs));
                      } // Get annotations


                      _context10.next = 12;
                      return dbHandler.getAnnotationsByIDs(matchedAnnotationIDs);

                    case 12:
                      annotationObjects = _context10.sent;
                      // Get images
                      images = [];
                      _loop3 =
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _loop3(_k3) {
                        var foundImage;
                        return regeneratorRuntime.wrap(function _loop3$(_context8) {
                          while (1) {
                            switch (_context8.prev = _context8.next) {
                              case 0:
                                _context8.next = 2;
                                return dbHandler.getImageFromAnnotationID(annotationObjects[_k3].ID);

                              case 2:
                                foundImage = _context8.sent;

                                if (images.some(function (image) {
                                  return image.ID === foundImage.ID;
                                })) {
                                  // Bild schon enthalten
                                  images.forEach(function (image) {
                                    if (image.ID === foundImage.ID) image.annotations.push(annotationObjects[_k3]);
                                  });
                                } else {
                                  foundImage.annotations = [annotationObjects[_k3]];
                                  images.push(foundImage);
                                }

                              case 4:
                              case "end":
                                return _context8.stop();
                            }
                          }
                        }, _loop3);
                      });
                      _k3 = 0;

                    case 16:
                      if (!(_k3 < annotationObjects.length)) {
                        _context10.next = 21;
                        break;
                      }

                      return _context10.delegateYield(_loop3(_k3), "t1", 18);

                    case 18:
                      _k3++;
                      _context10.next = 16;
                      break;

                    case 21:
                      _loop4 =
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _loop4(y) {
                        var foundSet;
                        return regeneratorRuntime.wrap(function _loop4$(_context9) {
                          while (1) {
                            switch (_context9.prev = _context9.next) {
                              case 0:
                                _context9.next = 2;
                                return dbHandler.getSetByImageID(images[y].ID);

                              case 2:
                                foundSet = _context9.sent;

                                if (searchResults3.some(function (set) {
                                  return set.ID === foundSet.ID;
                                })) {
                                  // Set schon enthalten
                                  searchResults3.forEach(function (set) {
                                    if (set.ID === foundSet.ID) set.annotatedImages.push(images[y]);
                                  });
                                } else {
                                  foundSet.annotatedImages = [images[y]];
                                  searchResults3.push(foundSet);
                                }

                              case 4:
                              case "end":
                                return _context9.stop();
                            }
                          }
                        }, _loop4);
                      });
                      y = 0;

                    case 23:
                      if (!(y < images.length)) {
                        _context10.next = 28;
                        break;
                      }

                      return _context10.delegateYield(_loop4(y), "t2", 25);

                    case 25:
                      y++;
                      _context10.next = 23;
                      break;

                    case 28:
                      return _context10.abrupt("return", {
                        v: searchResults3
                      });

                    case 29:
                    case "end":
                      return _context10.stop();
                  }
                }
              }, _callee7);
            })(), "t0", 29);

          case 29:
            _ret = _context11.t0;

            if (!(_typeof(_ret) === "object")) {
              _context11.next = 32;
              break;
            }

            return _context11.abrupt("return", _ret.v);

          case 32:
            _context11.next = 35;
            break;

          case 34:
            return _context11.abrupt("return", setsSearchResults);

          case 35:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee8);
  }));
  return _searchByAttributes.apply(this, arguments);
}

var _default = router;
exports["default"] = _default;
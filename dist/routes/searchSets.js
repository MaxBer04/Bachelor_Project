"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _express = _interopRequireDefault(require("express"));

var _login = require("./login.js");

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var router = _express["default"].Router(); // This class mainly handles the requests for the search function


router.get('/', _login.verifyToken, function _callee(req, res) {
  return _regenerator["default"].async(function _callee$(_context) {
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
  });
});
router.get('/confirmed', _login.verifyToken, function _callee2(req, res) {
  var dbHandler, searchResults3, searchResults, searchResults2, usersArray, userID, i, k;
  return _regenerator["default"].async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // Bei den Modes bedeutet false OR und true AND
          dbHandler = new _databaseHandler["default"]();

          if (!(!req.query.users && !req.query.sets && !req.query.attributes)) {
            _context2.next = 7;
            break;
          }

          _context2.next = 4;
          return _regenerator["default"].awrap(searchAllAnnotatedSets(dbHandler));

        case 4:
          searchResults3 = _context2.sent;
          _context2.next = 16;
          break;

        case 7:
          _context2.next = 9;
          return _regenerator["default"].awrap(searchByUserEmails(req.query, dbHandler));

        case 9:
          searchResults = _context2.sent;
          _context2.next = 12;
          return _regenerator["default"].awrap(searchBySets(req.query, searchResults, dbHandler));

        case 12:
          searchResults2 = _context2.sent;
          _context2.next = 15;
          return _regenerator["default"].awrap(searchByAttributes(req.query, searchResults2, dbHandler));

        case 15:
          searchResults3 = _context2.sent;

        case 16:
          usersArray = Array.isArray(req.query.users) ? req.query.users : [req.query.users];

          if (!(usersArray.length === 1 && usersArray[0])) {
            _context2.next = 34;
            break;
          }

          _context2.next = 20;
          return _regenerator["default"].awrap(dbHandler.getIDByEmail(usersArray[0]));

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
          return _regenerator["default"].awrap(dbHandler.getAnnotationDateForImage(searchResults3[i].annotatedImages[k].ID, userID));

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

        case 35:
        case "end":
          return _context2.stop();
      }
    }
  });
});

function searchAllAnnotatedSets(dbHandler) {
  var annotatedSets, i;
  return _regenerator["default"].async(function searchAllAnnotatedSets$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _regenerator["default"].awrap(dbHandler.getAllAnnotatedSets());

        case 2:
          annotatedSets = _context3.sent;
          i = 0;

        case 4:
          if (!(i < annotatedSets.length)) {
            _context3.next = 11;
            break;
          }

          _context3.next = 7;
          return _regenerator["default"].awrap(dbHandler.getAnnotatedImagesFromSet(annotatedSets[i].ID));

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
  });
}

function searchByUserEmails(reqQuery, dbHandler) {
  var searchResults, mode, users;
  return _regenerator["default"].async(function searchByUserEmails$(_context4) {
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
          return _regenerator["default"].awrap(dbHandler.getSetsByUserAnnotations(users, mode));

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
  });
}

function removeDuplicates(setList) {
  setList = setList.filter(function (set, index, self) {
    return index === self.findIndex(function (foundSet) {
      foundSet.ID === set.ID;
    });
  });
}

function searchBySets(reqQuery, userSearchResults, dbHandler) {
  var searchResults2, sets, i, k, userMode, userEmails, _i, l, image;

  return _regenerator["default"].async(function searchBySets$(_context6) {
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
          return _regenerator["default"].awrap(dbHandler.getSetsByID(sets));

        case 11:
          searchResults2 = _context6.sent;

        case 12:
          if (!searchResults2) {
            _context6.next = 38;
            break;
          }

          userMode = reqQuery.userMode === 'true' ? 'AND' : 'OR';
          userEmails = reqQuery.users;
          if (!Array.isArray(userEmails)) userEmails = [userEmails];
          _i = searchResults2.length - 1;

        case 17:
          if (!(_i >= 0)) {
            _context6.next = 38;
            break;
          }

          if (!userEmails[0]) {
            _context6.next = 23;
            break;
          }

          _context6.next = 21;
          return _regenerator["default"].awrap(function _callee3() {
            var userIDs, l, image, _k, annotations;

            return _regenerator["default"].async(function _callee3$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return _regenerator["default"].awrap(dbHandler.getIDsFromEmails(userEmails));

                  case 2:
                    userIDs = _context5.sent;
                    userIDs.forEach(function (IDobj, index) {
                      userIDs[index] = IDobj.ID;
                    });
                    _context5.next = 6;
                    return _regenerator["default"].awrap(dbHandler.getAnnotatedImagesFromUsers(userIDs, searchResults2[_i].ID, userMode));

                  case 6:
                    searchResults2[_i].annotatedImages = _context5.sent;

                    if (!(searchResults2[_i].annotatedImages.length === 0)) {
                      _context5.next = 11;
                      break;
                    }

                    searchResults2.splice(_i, 1);
                    _context5.next = 30;
                    break;

                  case 11:
                    l = 0;

                  case 12:
                    if (!(l < searchResults2[_i].annotatedImages.length)) {
                      _context5.next = 30;
                      break;
                    }

                    image = searchResults2[_i].annotatedImages[l];
                    image.annotations = [];
                    _k = 0;

                  case 16:
                    if (!(_k < userIDs.length)) {
                      _context5.next = 27;
                      break;
                    }

                    _context5.next = 19;
                    return _regenerator["default"].awrap(dbHandler.getAnnotationsFromImage(userIDs[_k], image.ID));

                  case 19:
                    annotations = _context5.sent;
                    _context5.next = 22;
                    return _regenerator["default"].awrap(dbHandler.isImageAnnotatedByUser(userIDs[_k], image.ID));

                  case 22:
                    if (!_context5.sent) {
                      _context5.next = 24;
                      break;
                    }

                    image.annotations = image.annotations.concat(annotations);

                  case 24:
                    _k++;
                    _context5.next = 16;
                    break;

                  case 27:
                    l++;
                    _context5.next = 12;
                    break;

                  case 30:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          }());

        case 21:
          _context6.next = 35;
          break;

        case 23:
          _context6.next = 25;
          return _regenerator["default"].awrap(dbHandler.getAnnotatedImagesFromSet(searchResults2[_i].ID));

        case 25:
          searchResults2[_i].annotatedImages = _context6.sent;
          l = 0;

        case 27:
          if (!(l < searchResults2[_i].annotatedImages.length)) {
            _context6.next = 35;
            break;
          }

          image = searchResults2[_i].annotatedImages[l];
          _context6.next = 31;
          return _regenerator["default"].awrap(dbHandler.getAllAnnotationsFromImage(image.ID));

        case 31:
          image.annotations = _context6.sent;

        case 32:
          l++;
          _context6.next = 27;
          break;

        case 35:
          _i--;
          _context6.next = 17;
          break;

        case 38:
          return _context6.abrupt("return", searchResults2);

        case 39:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function searchByAttributes(reqQuery, setsSearchResults, dbHandler) {
  var mode, attributes, k, m, l, currentAnnotation, _k2, _m, _loop, _l, _ret;

  return _regenerator["default"].async(function searchByAttributes$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          if (!reqQuery.attributes) {
            _context11.next = 35;
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
          return _regenerator["default"].awrap(dbHandler.getAttributesFromAnnotation(currentAnnotation.ID));

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
          _context11.next = 30;
          return _regenerator["default"].awrap(function _callee4() {
            var searchResults3, matchedAnnotationIDs, annotationIDs, _loop2, i, allAnnotationIDs, annotationObjects, images, _loop3, _k3, _loop4, y;

            return _regenerator["default"].async(function _callee4$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    searchResults3 = [];
                    // Get IDs für Annotationen zu den Attributen
                    annotationIDs = [];

                    _loop2 = function _loop2(i) {
                      var parsedAnnotationIDs;
                      return _regenerator["default"].async(function _loop2$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              _context7.next = 2;
                              return _regenerator["default"].awrap(dbHandler.getAnnotationIDsByText(attributes[i]));

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
                      });
                    };

                    i = 0;

                  case 4:
                    if (!(i < attributes.length)) {
                      _context10.next = 10;
                      break;
                    }

                    _context10.next = 7;
                    return _regenerator["default"].awrap(_loop2(i));

                  case 7:
                    i++;
                    _context10.next = 4;
                    break;

                  case 10:
                    if (mode === 'AND') {
                      // match annotationIDs
                      matchedAnnotationIDs = annotationIDs.shift().filter(function (e1) {
                        return annotationIDs.every(function (e2) {
                          return e2.indexOf(e1) !== -1;
                        });
                      });
                    } else {
                      allAnnotationIDs = [].concat.apply([], annotationIDs);
                      matchedAnnotationIDs = (0, _toConsumableArray2["default"])(new Set(allAnnotationIDs));
                    } // Get annotations


                    _context10.next = 13;
                    return _regenerator["default"].awrap(dbHandler.getAnnotationsByIDs(matchedAnnotationIDs));

                  case 13:
                    annotationObjects = _context10.sent;
                    // Get images
                    images = [];

                    _loop3 = function _loop3(_k3) {
                      var foundImage;
                      return _regenerator["default"].async(function _loop3$(_context8) {
                        while (1) {
                          switch (_context8.prev = _context8.next) {
                            case 0:
                              _context8.next = 2;
                              return _regenerator["default"].awrap(dbHandler.getImageFromAnnotationID(annotationObjects[_k3].ID));

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
                      });
                    };

                    _k3 = 0;

                  case 17:
                    if (!(_k3 < annotationObjects.length)) {
                      _context10.next = 23;
                      break;
                    }

                    _context10.next = 20;
                    return _regenerator["default"].awrap(_loop3(_k3));

                  case 20:
                    _k3++;
                    _context10.next = 17;
                    break;

                  case 23:
                    _loop4 = function _loop4(y) {
                      var foundSet;
                      return _regenerator["default"].async(function _loop4$(_context9) {
                        while (1) {
                          switch (_context9.prev = _context9.next) {
                            case 0:
                              _context9.next = 2;
                              return _regenerator["default"].awrap(dbHandler.getSetByImageID(images[y].ID));

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
                      });
                    };

                    y = 0;

                  case 25:
                    if (!(y < images.length)) {
                      _context10.next = 31;
                      break;
                    }

                    _context10.next = 28;
                    return _regenerator["default"].awrap(_loop4(y));

                  case 28:
                    y++;
                    _context10.next = 25;
                    break;

                  case 31:
                    return _context10.abrupt("return", {
                      v: searchResults3
                    });

                  case 32:
                  case "end":
                    return _context10.stop();
                }
              }
            });
          }());

        case 30:
          _ret = _context11.sent;

          if (!((0, _typeof2["default"])(_ret) === "object")) {
            _context11.next = 33;
            break;
          }

          return _context11.abrupt("return", _ret.v);

        case 33:
          _context11.next = 36;
          break;

        case 35:
          return _context11.abrupt("return", setsSearchResults);

        case 36:
        case "end":
          return _context11.stop();
      }
    }
  });
}

var _default = router;
exports["default"] = _default;
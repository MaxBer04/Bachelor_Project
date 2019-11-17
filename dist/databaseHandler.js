"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sqlite = require('sqlite3').verbose();

var utf8 = require('utf8');

var DATABASE_PATH = './database/database.db';

var DBHandler =
/*#__PURE__*/
function () {
  function DBHandler() {
    _classCallCheck(this, DBHandler);

    this._db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, function (err) {
      if (err) throw err;
      console.log("Connected to Database...");
    });
  }

  _createClass(DBHandler, [{
    key: "close",
    value: function close() {
      this._db.close(function (err) {
        if (err) throw err;else console.log("Disconnected from Database...");
      });
    } // CHECK

  }, {
    key: "isValidUser",
    value: function isValidUser(email, password) {
      var _this = this;

      var SQL = 'SELECT * FROM User WHERE passwordHash = ? AND email = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this._db.prepare(SQL);

        statement.get([password, email], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          if (!row) {
            statement.finalize();
            resolve('failed');
          } else {
            statement.finalize();
            resolve('success');
          }
        });
      });
    }
  }, {
    key: "isVerified",
    value: function isVerified(userID) {
      var _this2 = this;

      var SQL = 'SELECT * FROM User WHERE ID = ? AND verified = 1;';
      return new Promise(function (resolve, reject) {
        var statement = _this2._db.prepare(SQL);

        statement.get([userID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          } else if (row) {
            statement.finalize();
            resolve(true);
          } else {
            statement.finalize();
            resolve(false);
          }
        });
      });
    }
  }, {
    key: "isAdmin",
    value: function isAdmin(userID) {
      var _this3 = this;

      var SQL = 'SELECT * FROM Admin WHERE userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this3._db.prepare(SQL);

        statement.get([userID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          } else if (row) {
            statement.finalize();
            resolve(true);
          } else {
            statement.finalize();
            resolve(false);
          }
        });
      });
    }
  }, {
    key: "isImageSetAnnotated",
    value: function isImageSetAnnotated(userID, imageSetID) {
      var _this4 = this;

      var SQL = 'SELECT * FROM ImageSet_annotated_by_User WHERE userID = ? AND imageSetID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this4._db.prepare(SQL);

        statement.get([userID, imageSetID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          } else if (row) {
            statement.finalize();
            resolve(true);
          } else {
            statement.finalize();
            resolve(false);
          }
        });
      });
    }
  }, {
    key: "isImageAnnotatedByUser",
    value: function isImageAnnotatedByUser(userID, imageID) {
      var _this5 = this;

      //const SQL = `SELECT * FROM Image_annotated_by_User WHERE userID = ${userID} AND imageID = ${imageID};`;
      var SQL = 'SELECT * FROM Image_annotated_by_User WHERE userID = ? AND imageID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this5._db.prepare(SQL);

        statement.get([userID, imageID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          } else if (row) {
            statement.finalize();
            resolve(true);
          } else {
            statement.finalize();
            resolve(false);
          }
        });
      });
    } // GET

  }, {
    key: "getSetsByUserAnnotations",
    value: function () {
      var _getSetsByUserAnnotations = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(userEmails, mode) {
        var _this6 = this;

        var resultSets, userIDs, i, ID, SQL, _i;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                resultSets = [];
                userIDs = [];
                i = 0;

              case 3:
                if (!(i < userEmails.length)) {
                  _context.next = 11;
                  break;
                }

                _context.next = 6;
                return this.getIDByEmail(userEmails[i]);

              case 6:
                ID = _context.sent;
                userIDs.push(ID);

              case 8:
                i++;
                _context.next = 3;
                break;

              case 11:
                SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User WHERE userID = ?)';

                for (_i = 1; _i < userIDs.length; _i++) {
                  SQL += ' ' + mode + ' ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User WHERE userID = ?)';
                }

                SQL += ';';
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var statement = _this6._db.prepare(SQL);

                  statement.all(userIDs, function (err, rows) {
                    if (err) {
                      statement.finalize();
                      reject(err);
                    }

                    for (var _i2 = 0; _i2 < rows.length; _i2++) {
                      resultSets.push(rows[_i2]);
                    }

                    statement.finalize();
                    resolve(resultSets);
                  });
                }));

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getSetsByUserAnnotations(_x, _x2) {
        return _getSetsByUserAnnotations.apply(this, arguments);
      }

      return getSetsByUserAnnotations;
    }()
  }, {
    key: "getIDByEmail",
    value: function getIDByEmail(email) {
      var _this7 = this;

      var SQL = 'SELECT ID FROM User WHERE email = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this7._db.prepare(SQL);

        statement.get([email], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row.ID);
        });
      });
    }
  }, {
    key: "getEmailByID",
    value: function getEmailByID(ID) {
      var _this8 = this;

      //const SQL = `SELECT email FROM User WHERE ID='${ID}';`;
      var SQL = 'SELECT email FROM User WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this8._db.prepare(SQL);

        statement.get([ID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row.email);
        });
      });
    }
  }, {
    key: "getIDsFromEmails",
    value: function getIDsFromEmails(emails) {
      var _this9 = this;

      var SQL = 'SELECT ID FROM User WHERE email IN (?#);';
      SQL = this.arraySearch(SQL, emails);
      return new Promise(function (resolve, reject) {
        var statement = _this9._db.prepare(SQL);

        statement.all(emails, function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllUsers",
    value: function getAllUsers() {
      var _this10 = this;

      //const SQL = 'SELECT * FROM User;';
      var SQL = 'SELECT * FROM User;';
      return new Promise(function (resolve, reject) {
        var statement = _this10._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllUserEmails",
    value: function getAllUserEmails() {
      var _this11 = this;

      var SQL = 'SELECT * FROM User;';
      return new Promise(function (resolve, reject) {
        var emails = [];

        var statement = _this11._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            rows.forEach(function (row) {
              emails.push(row.email);
            });
            statement.finalize();
            resolve(emails);
          }
        });
      });
    }
  }, {
    key: "getUser",
    value: function getUser(ID) {
      var _this12 = this;

      var SQL = 'SELECT * FROM User WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this12._db.prepare(SQL);

        statement.get([ID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getUserByEmail",
    value: function getUserByEmail(email) {
      var _this13 = this;

      var SQL = 'SELECT * FROM User WHERE email = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this13._db.prepare(SQL);

        statement.all([email], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getFirstAndLastname",
    value: function getFirstAndLastname(ID) {
      var _this14 = this;

      var SQL = 'SELECT first_name, last_name FROM User WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this14._db.prepare(SQL);

        statement.get([ID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getAnnotatedImagesFromUsers",
    value: function getAnnotatedImagesFromUsers(userIDs, setID, userMode) {
      var _this15 = this;

      var SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ? AND ID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID  = ?)';

      for (var i = 1; i < userIDs.length; i++) {
        SQL += ' ' + userMode + ' ID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID  = ?)';
      }

      SQL += ';';
      var params = [setID].concat(userIDs);
      return new Promise(function (resolve, reject) {
        var statement = _this15._db.prepare(SQL);

        statement.all(params, function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllUserIDsForAnnotatedImage",
    value: function getAllUserIDsForAnnotatedImage(imageID) {
      var _this16 = this;

      var SQL = 'SELECT userID FROM Image_annotated_by_User WHERE imageID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this16._db.prepare(SQL);

        statement.all([imageID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getUserIDFromAnnotationID",
    value: function getUserIDFromAnnotationID(annotationID) {
      var _this17 = this;

      var SQL = 'SELECT userID FROM Annotation WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this17._db.prepare(SQL);

        statement.get([annotationID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getAnnotatedImagesFromSet",
    value: function getAnnotatedImagesFromSet(setID) {
      var _this18 = this;

      var SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ? AND ID IN (SELECT imageID FROM Image_annotated_by_User);';
      return new Promise(function (resolve, reject) {
        var statement = _this18._db.prepare(SQL);

        statement.all([setID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationsFromImage",
    value: function getAnnotationsFromImage(userID, imageID) {
      var _this19 = this;

      var SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this19._db.prepare(SQL);

        statement.all([imageID, userID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllAnnotationsFromImage",
    value: function getAllAnnotationsFromImage(imageID) {
      var _this20 = this;

      var SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this20._db.prepare(SQL);

        statement.all([imageID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllAnnotatedSets",
    value: function getAllAnnotatedSets() {
      var _this21 = this;

      var SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User);';
      return new Promise(function (resolve, reject) {
        var statement = _this21._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationIDs",
    value: function getAnnotationIDs(userID, imageID) {
      var _this22 = this;

      var SQL = 'SELECT ID FROM Annotation WHERE imageID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this22._db.prepare(SQL);

        statement.all([imageID, userID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationsByIDs",
    value: function getAnnotationsByIDs(IDs) {
      var _this23 = this;

      var SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE ID = ?';

      for (var i = 1; i < IDs.length; i++) {
        SQL += ' OR ID = ?';
      }

      SQL += ';';
      return new Promise(function (resolve, reject) {
        var statement = _this23._db.prepare(SQL);

        statement.all([IDs], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationIDsByText",
    value: function getAnnotationIDsByText(text) {
      var _this24 = this;

      var SQL = 'SELECT annotationID FROM Attribut WHERE text = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this24._db.prepare(SQL);

        statement.all([text], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getImageFromAnnotationID",
    value: function getImageFromAnnotationID(annotationID) {
      var _this25 = this;

      var SQL = 'SELECT ID, path FROM Image WHERE ID IN (SELECT imageID FROM Annotation WHERE ID = ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this25._db.prepare(SQL);

        statement.get([annotationID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getAttributesFromAnnotation",
    value: function getAttributesFromAnnotation(annotationID) {
      var _this26 = this;

      var SQL = 'SELECT ID, text FROM Attribut WHERE annotationID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this26._db.prepare(SQL);

        statement.all([annotationID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getPointsFromAnnotation",
    value: function getPointsFromAnnotation(annotationID) {
      var _this27 = this;

      var SQL = 'SELECT X, Y FROM Point WHERE annotationID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this27._db.prepare(SQL);

        statement.all([annotationID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getImagePathAndTypFromSet",
    value: function getImagePathAndTypFromSet(imageSetID) {
      var _this28 = this;

      var SQL = 'SELECT path, type FROM Image WHERE imageSetID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this28._db.prepare(SQL);

        statement.all([imageSetID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getImageSetTitle",
    value: function getImageSetTitle(imageSetID) {
      var _this29 = this;

      var SQL = 'SELECT title FROM ImageSet WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this29._db.prepare(SQL);

        statement.get([imageSetID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getImageIDAndPathFromSet",
    value: function getImageIDAndPathFromSet(imageSetID) {
      var _this30 = this;

      var SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this30._db.prepare(SQL);

        statement.all([imageSetID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationDateForImage",
    value: function getAnnotationDateForImage(imageID, userID) {
      var _this31 = this;

      var SQL = 'SELECT timestamp FROM Image_annotated_by_User WHERE imageID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this31._db.prepare(SQL);

        statement.get([imageID, userID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    }
  }, {
    key: "getAllImageSetIDs",
    value: function getAllImageSetIDs() {
      var _this32 = this;

      var SQL = 'SELECT * FROM ImageSet;';
      return new Promise(function (resolve, reject) {
        var statement = _this32._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            var IDs = [];

            for (var i = 0; i < rows.length; i++) {
              IDs.push(rows[i].ID);
            }

            statement.finalize();
            resolve(rows);
          }
        });
      });
    }
  }, {
    key: "getAllImageSets",
    value: function getAllImageSets() {
      var _this33 = this;

      var SQL = 'SELECT * FROM ImageSet;';
      return new Promise(function (resolve, reject) {
        var statement = _this33._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllAttributesText",
    value: function getAllAttributesText() {
      var _this34 = this;

      var SQL = "SELECT text FROM Attribut;";
      return new Promise(function (resolve, reject) {
        var statement = _this34._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getAllAttributes",
    value: function getAllAttributes() {
      var _this35 = this;

      var SQL = "SELECT * FROM Attribut;";
      return new Promise(function (resolve, reject) {
        var statement = _this35._db.prepare(SQL);

        statement.all([], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(rows);
        });
      });
    }
  }, {
    key: "getSetsByID",
    value: function getSetsByID(setIDs) {
      var _this36 = this;

      var resultSets = [];
      var SQL = 'SELECT * FROM ImageSet WHERE ID IN (?#);';
      SQL = this.arraySearch(SQL, setIDs);
      return new Promise(function (resolve, reject) {
        var statement = _this36._db.prepare(SQL);

        statement.all([setIDs], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          for (var i = 0; i < rows.length; i++) {
            resultSets.push(rows[i]);
          }

          statement.finalize();
          resolve(resultSets);
        });
      });
    }
  }, {
    key: "getSetByImageID",
    value: function getSetByImageID(imageID) {
      var _this37 = this;

      var SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM Image WHERE ID = ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this37._db.prepare(SQL);

        statement.get([imageID], function (err, row) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve(row);
        });
      });
    } // HELPER

  }, {
    key: "arraySearch",
    value: function arraySearch(sql, arr) {
      return sql.replace('?#', arr.map(function () {
        return '?';
      }).join(','));
    } // ADD / CREATE

  }, {
    key: "createNewImageSet",
    value: function createNewImageSet(title) {
      var _this38 = this;

      var currentdate = new Date();
      var SQL = 'INSERT INTO ImageSet(ID, title, upload_date) VALUES(null, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this38._db.prepare(SQL);

        statement.run([title, currentdate.toISOString()], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve(this.lastID);
          }
        });
      });
    }
  }, {
    key: "addAttributesToAnnotation",
    value: function addAttributesToAnnotation(annotationID, attributes) {
      var _this39 = this;

      var SQL = "INSERT INTO Attribut(ID, annotationID, text) VALUES (null, ?, ?);";
      return new Promise(function (resolve, reject) {
        _this39._db.serialize(function () {
          var statement = this.prepare(SQL);

          for (var i = 0; i < attributes.length; i++) {
            statement.run([annotationID, attributes[i]._content], function (err, row) {
              if (err) {
                statement.finalize();
                reject(err);
              }
            });
          }

          statement.finalize();
          resolve();
        });
      });
    }
  }, {
    key: "newAnnotationByUser",
    value: function newAnnotationByUser(userID, imageID) {
      var _this40 = this;

      var currentdate = new Date();
      var SQL = 'INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (?, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this40._db.prepare(SQL);

        statement.run([imageID, userID, currentdate.toISOString()], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "addUser",
    value: function addUser(user) {
      var _this41 = this;

      var SQL = 'INSERT INTO User(email, passwordHash, ID, verified, first_name, last_name) VALUES (?, ?, null, null, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this41._db.prepare(SQL);

        statement.run([user.email, user.password, user.firstName, user.lastName], function (error) {
          if (error) {
            statement.finalize();
            reject(error);
          } else {
            statement.finalize();
            resolve(this.lastID);
          }
        });
      });
    }
  }, {
    key: "addAnnotationToImage",
    value: function addAnnotationToImage(imageID, userID, polygon) {
      var _this42 = this;

      var SQL = 'INSERT INTO Annotation(ID, imageID, userID, shape, text, color, name) VALUES (null, ?, ?, ?, ?, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this42._db.prepare(SQL);

        statement.run([imageID, userID, polygon._shape, polygon._text, polygon._fillColor, polygon._name], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve(this.lastID);
          }
        });
      });
    }
  }, {
    key: "addPointsToAnnotation",
    value: function addPointsToAnnotation(annotationID, points) {
      var _this43 = this;

      var SQL = "INSERT INTO Point(ID, X, Y, annotationID) VALUES (null, ?, ?, ?);";
      return new Promise(function (resolve, reject) {
        _this43._db.serialize(function () {
          var statement = this.prepare(SQL);

          for (var i = 0; i < points.length; i++) {
            statement.run([points[i].X, points[i].Y, annotationID], function (err, row) {
              if (err) {
                statement.finalize();
                reject(err);
              }
            });
          }

          statement.finalize();
          resolve();
        });
      });
    }
  }, {
    key: "addImageToImageSet",
    value: function addImageToImageSet(imageURL, imageSetID, type) {
      var _this44 = this;

      var SQL = 'INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ?, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this44._db.prepare(SQL);

        statement.run([imageSetID, imageURL, type], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve(this.lastID);
          }
        });
      });
    }
  }, {
    key: "addImagesToImageSet",
    value: function addImagesToImageSet(imageSetID, images) {
      var _this45 = this;

      var SQL = 'INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ?, ?, ?);';
      return new Promise(function (resolve, reject) {
        _this45._db.serialize(function () {
          var statement = this.prepare(SQL);

          for (var i = 0; i < images.length; i++) {
            statement.run([imageSetID, images[i].path, images[i].type], function (err) {
              if (err) {
                statement.finalize();
                reject(err);
              }
            });
          }

          statement.finalize();
          resolve();
        });
      });
    }
  }, {
    key: "markImageSetAsAnnotated",
    value: function markImageSetAsAnnotated(userID, imageSetID) {
      var _this46 = this;

      var currentdate = new Date();
      var SQL = 'INSERT INTO ImageSet_annotated_by_User(imageSetID, userID, timestamp) VALUES (?, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this46._db.prepare(SQL);

        statement.run([imageSetID, userID, currentdate.toISOString()], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "markImageAsAnnotated",
    value: function markImageAsAnnotated(userID, imageID) {
      var _this47 = this;

      var currentdate = new Date();
      var SQL = 'INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (?, ?, ?);';
      return new Promise(function (resolve, reject) {
        var statement = _this47._db.prepare(SQL);

        statement.run([imageID, userID, currentdate.toISOString()], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "setUserAsAdmin",
    value: function setUserAsAdmin(userID) {
      var _this48 = this;

      var SQL = 'INSERT INTO Admin(userID) VALUES (?);';
      return new Promise(function (resolve, reject) {
        var statement = _this48._db.prepare(SQL);

        statement.run([userID], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "setUserVerified",
    value: function setUserVerified(userID) {
      var _this49 = this;

      var SQL = 'UPDATE User SET verified = true WHERE ID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this49._db.prepare(SQL);

        statement.run([userID], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    } // DELETE 

  }, {
    key: "deleteAllAnnotationsForImage",
    value: function deleteAllAnnotationsForImage(userID, imageID) {
      var _this50 = this;

      var SQL = 'DELETE FROM Annotation WHERE imageID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this50._db.prepare(SQL);

        statement.run([imageID, userID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "deletePoints",
    value: function deletePoints(annotationID) {
      var _this51 = this;

      var SQL = 'DELETE FROM Point WHERE annotationID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this51._db.prepare(SQL);

        statement.run([annotationID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "deleteAttributes",
    value: function deleteAttributes(annotationID) {
      var _this52 = this;

      var SQL = 'DELETE FROM Attribut WHERE annotationID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this52._db.prepare(SQL);

        statement.run([annotationID], function (err, rows) {
          if (err) {
            statement.finalize();
            reject(err);
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "removeImageAsAnnotated",
    value: function removeImageAsAnnotated(userID, imageID) {
      var _this53 = this;

      var SQL = 'DELETE FROM Image_annotated_by_User WHERE userID = ? AND imageID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this53._db.prepare(SQL);

        statement.get([userID, imageID], function (err, row) {
          if (err) {
            statement.finalize();
            reject();
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    }
  }, {
    key: "removeImageSetAsAnnotated",
    value: function removeImageSetAsAnnotated(userID, imageSetID) {
      var _this54 = this;

      //const SQL = `DELETE FROM ImageSet_annotated_by_User WHERE userID = ${userID} AND  imageSetID = ${imageSetID};`;
      var SQL = 'DELETE FROM ImageSet_annotated_by_User WHERE userID = ? AND imageSetID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this54._db.prepare(SQL);

        statement.get([userID, imageSetID], function (err, row) {
          if (err) {
            statement.finalize();
            reject();
          } else {
            statement.finalize();
            resolve();
          }
        });
      });
    } // UPDATE

  }, {
    key: "updateAnnotationTimestampForImageSet",
    value: function updateAnnotationTimestampForImageSet(imageSetID, userID, currentDateISO) {
      var _this55 = this;

      var SQL = 'UPDATE ImageSet_annotated_by_User SET timestamp = ? WHERE imageSetID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this55._db.prepare(SQL);

        statement.run([currentDateISO, imageSetID, userID], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve();
        });
      });
    }
  }, {
    key: "updateAnnotationTimestampForImage",
    value: function updateAnnotationTimestampForImage(imageID, userID, currentDateISO) {
      var _this56 = this;

      var SQL = 'UPDATE Image_annotated_by_User SET timestamp = ? WHERE imageID = ? AND userID = ?;';
      return new Promise(function (resolve, reject) {
        var statement = _this56._db.prepare(SQL);

        statement.run([currentDateISO, imageID, userID], function (err) {
          if (err) {
            statement.finalize();
            reject(err);
          }

          statement.finalize();
          resolve();
        });
      });
    }
  }]);

  return DBHandler;
}();

exports["default"] = DBHandler;
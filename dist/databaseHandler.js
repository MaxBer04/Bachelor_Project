"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var sqlite = require('sqlite3').verbose();

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
  } // CHECK


  _createClass(DBHandler, [{
    key: "isValidUser",
    value: function isValidUser(email, password) {
      var _this = this;

      var SQL = "SELECT * FROM User WHERE passwordHash='".concat(password, "' AND email='").concat(email, "';");
      return new Promise(function (resolve, reject) {
        _this._db.get(SQL, [], function (err, row) {
          if (err) reject(err);

          if (!row) {
            resolve('failed');
          } else {
            resolve('success');
          }
        });
      });
    }
  }, {
    key: "isAdmin",
    value: function isAdmin(ID) {
      var _this2 = this;

      var SQL = "SELECT * FROM Admin WHERE userID=".concat(ID, ";");
      return new Promise(function (resolve, reject) {
        _this2._db.get(SQL, [], function (err, row) {
          if (err) reject();else if (row) resolve(true);else resolve(false);
        });
      });
    }
  }, {
    key: "isImageSetAnnotated",
    value: function isImageSetAnnotated(userID, imageSetID) {
      var _this3 = this;

      var SQL = "SELECT * FROM ImageSet_annotated_by_User WHERE userID = ".concat(userID, " AND  imageSetID = ").concat(imageSetID, ";");
      return new Promise(function (resolve, reject) {
        _this3._db.get(SQL, [], function (err, row) {
          if (err) reject();else if (row) resolve(true);else resolve(false);
        });
      });
    }
  }, {
    key: "isImageAnnotatedByUser",
    value: function isImageAnnotatedByUser(userID, imageID) {
      var _this4 = this;

      var SQL = "SELECT * FROM Image_annotated_by_User WHERE userID = ".concat(userID, " AND imageID = ").concat(imageID, ";");
      return new Promise(function (resolve, reject) {
        _this4._db.get(SQL, [], function (err, row) {
          if (err) reject();else if (row) resolve(true);else resolve(false);
        });
      });
    } // GET

  }, {
    key: "getIDByEmail",
    value: function getIDByEmail(email) {
      var _this5 = this;

      var SQL = "SELECT ID FROM User WHERE email='".concat(email, "';");
      return new Promise(function (resolve, reject) {
        _this5._db.get(SQL, [], function (err, row) {
          if (!row) reject(err);
          resolve(row.ID);
        });
      });
    }
  }, {
    key: "getUser",
    value: function getUser(ID) {
      var _this6 = this;

      var SQL = "SELECT * FROM User WHERE ID=".concat(ID, ";");
      return new Promise(function (resolve, reject) {
        _this6._db.get(SQL, [], function (err, row) {
          if (err) reject(err);
          resolve(row);
        });
      });
    }
  }, {
    key: "getUserByEmail",
    value: function getUserByEmail(email) {
      var _this7 = this;

      var SQL = "SELECT * FROM User WHERE email='".concat(email, "';");
      return new Promise(function (resolve, reject) {
        _this7._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    }
  }, {
    key: "getFirstAndLastname",
    value: function getFirstAndLastname(ID) {
      var _this8 = this;

      var SQL = "SELECT first_name, last_name FROM User WHERE ID=".concat(ID, ";");
      return new Promise(function (resolve, reject) {
        _this8._db.get(SQL, [], function (err, row) {
          if (err) reject(err);
          resolve(row);
        });
      });
    }
  }, {
    key: "getAllUsers",
    value: function getAllUsers() {
      var _this9 = this;

      var SQL = 'SELECT * FROM User;';
      return new Promise(function (resolve, reject) {
        var emails = [];

        _this9._db.all(SQL, function (err, rows) {
          if (err) reject(err);else {
            rows.forEach(function (row) {
              emails.push(row.email);
            });
            resolve(emails);
          }
        });
      });
    }
  }, {
    key: "getAnnotationsFromImage",
    value: function getAnnotationsFromImage(userID, imageID) {
      var _this10 = this;

      var SQL = "SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ".concat(imageID, " AND ").concat(userID, " IN (SELECT userID FROM Image_annotated_by_User WHERE imageID = ").concat(imageID, " AND userID = ").concat(userID, ");");
      return new Promise(function (resolve, reject) {
        _this10._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getAnnotationIDs",
    value: function getAnnotationIDs(userID, imageID) {
      var _this11 = this;

      var SQL = "SELECT ID FROM Annotation WHERE imageID = ".concat(imageID, " AND imageID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID = ").concat(userID, ");");
      return new Promise(function (resolve, reject) {
        _this11._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getAttributesFromAnnotation",
    value: function getAttributesFromAnnotation(annotationID) {
      var _this12 = this;

      var SQL = "SELECT ID, text FROM Attribut WHERE annotationID = ".concat(annotationID, ";");
      return new Promise(function (resolve, reject) {
        _this12._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getPointsFromAnnotation",
    value: function getPointsFromAnnotation(annotationID) {
      var _this13 = this;

      var SQL = "SELECT X, Y FROM Point WHERE annotationID = ".concat(annotationID, ";");
      return new Promise(function (resolve, reject) {
        _this13._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getImagePathAndTypFromSet",
    value: function getImagePathAndTypFromSet(imageSetID) {
      var _this14 = this;

      var SQL = "SELECT path,type FROM Image WHERE imageSetID = ".concat(imageSetID, ";");
      return new Promise(function (resolve, reject) {
        _this14._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getImageSetTitle",
    value: function getImageSetTitle(imageSetID) {
      var _this15 = this;

      var SQL = "SELECT title FROM ImageSet WHERE ID = ".concat(imageSetID, ";");
      return new Promise(function (resolve, reject) {
        _this15._db.get(SQL, [], function (err, row) {
          if (err) reject(err);else resolve(row);
        });
      });
    }
  }, {
    key: "getImageIDAndPathFromSet",
    value: function getImageIDAndPathFromSet(imageSetID) {
      var _this16 = this;

      var SQL = "SELECT ID,path FROM Image WHERE imageSetID=".concat(imageSetID, ";");
      return new Promise(function (resolve, reject) {
        _this16._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve(rows);
        });
      });
    }
  }, {
    key: "getAllImageSets",
    value: function getAllImageSets() {
      var _this17 = this;

      var SQL = 'SELECT * FROM ImageSet;';
      return new Promise(function (resolve, reject) {
        _this17._db.all(SQL, [], function (err, rows) {
          if (err) reject(err);else {
            var IDs = [];

            for (var i = 0; i < rows.length; i++) {
              IDs.push(rows[i].ID);
            }

            resolve(rows);
          }
        });
      });
    } // ADD / CREATE

  }, {
    key: "createNewImageSet",
    value: function createNewImageSet(title) {
      var _this18 = this;

      var currentdate = new Date();
      var SQL = "INSERT INTO ImageSet(ID, title, upload_date) VALUES(null, '".concat(title, "', '").concat(currentdate.toISOString(), "');");
      return new Promise(function (resolve, reject) {
        _this18._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve(this.lastID);
        });
      });
    }
  }, {
    key: "addAttributeToAnnotation",
    value: function addAttributeToAnnotation(annotationID, attribute) {
      var _this19 = this;

      var SQL = "INSERT INTO Attribut(ID, annotationID, text) VALUES (null, ".concat(annotationID, ", '").concat(attribute._content, "');");
      return new Promise(function (resolve, reject) {
        _this19._db.run(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "newAnnotationByUser",
    value: function newAnnotationByUser(userID, imageID) {
      var _this20 = this;

      var currentdate = new Date();
      var SQL = "INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (".concat(imageID, ", ").concat(userID, ", '").concat(currentdate.toISOString(), "');");
      return new Promise(function (resolve, reject) {
        _this20._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "addUser",
    value: function addUser(user) {
      var _this21 = this;

      var SQL = "INSERT INTO user(email, passwordHash, ID, verified, first_name, last_name) VALUES(\n      '".concat(user.email, "', '").concat(user.password, "', null, null, '").concat(user.firstName, "', '").concat(user.lastName, "');\n      ");
      return new Promise(function (resolve, reject) {
        _this21._db.exec(SQL, function (error) {
          if (error) throw error;
          resolve();
        });
      });
    }
  }, {
    key: "addAnnotationToImage",
    value: function addAnnotationToImage(imageID, polygon) {
      var _this22 = this;

      var SQL = "INSERT INTO Annotation(ID, imageID, shape, text, color, name) VALUES (null, ".concat(imageID, ", '").concat(polygon._shape, "', '").concat(polygon._text, "', '").concat(polygon._fillColor, "', '").concat(polygon._name, "');");
      return new Promise(function (resolve, reject) {
        _this22._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve(this.lastID);
        });
      });
    }
  }, {
    key: "addPointToAnnotation",
    value: function addPointToAnnotation(annotationID, point) {
      var _this23 = this;

      var SQL = "INSERT INTO Point(ID, X, Y, annotationID) VALUES (null, ".concat(point.X, ", ").concat(point.Y, ", ").concat(annotationID, ")");
      return new Promise(function (resolve, reject) {
        _this23._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "addImageToImageSet",
    value: function addImageToImageSet(imageURL, imageSetID, type) {
      var _this24 = this;

      var SQL = "INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ".concat(imageSetID, ", '").concat(imageURL, "', '").concat(type, "');");
      return new Promise(function (resolve, reject) {
        _this24._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve(this.lastID);
        });
      });
    }
  }, {
    key: "markImageSetAsAnnotated",
    value: function markImageSetAsAnnotated(userID, imageSetID) {
      var _this25 = this;

      var currentdate = new Date();
      var SQL = "INSERT INTO ImageSet_annotated_by_User(imageSetID, userID, timestamp) VALUES (".concat(imageSetID, ", ").concat(userID, ", '").concat(currentdate.toISOString(), "');");
      return new Promise(function (resolve, reject) {
        _this25._db.run(SQL, [], function (err) {
          if (err) reject(err);else resolve();
        });
      });
    } // DELETE 

  }, {
    key: "deleteAllAnnotationsForImage",
    value: function deleteAllAnnotationsForImage(userID, imageID) {
      var _this26 = this;

      var SQL = "DELETE FROM Annotation WHERE imageID = ".concat(imageID, " AND imageID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID = ").concat(userID, ");");
      return new Promise(function (resolve, reject) {
        _this26._db.run(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "deletePoints",
    value: function deletePoints(annotationID) {
      var _this27 = this;

      var SQL = "DELETE FROM Point WHERE annotationID = ".concat(annotationID, ";");
      return new Promise(function (resolve, reject) {
        _this27._db.run(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "deleteAttributes",
    value: function deleteAttributes(annotationID) {
      var _this28 = this;

      var SQL = "DELETE FROM Attribut WHERE annotationID = ".concat(annotationID, ";");
      return new Promise(function (resolve, reject) {
        _this28._db.run(SQL, [], function (err, rows) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }, {
    key: "removeImageAsAnnotated",
    value: function removeImageAsAnnotated(userID, imageID) {
      var _this29 = this;

      var SQL = "DELETE FROM Image_annotated_by_User WHERE userID = ".concat(userID, " AND  imageID = ").concat(imageID, ";");
      return new Promise(function (resolve, reject) {
        _this29._db.get(SQL, [], function (err, row) {
          if (err) reject();else resolve();
        });
      });
    }
  }, {
    key: "removeImageSetAsAnnotated",
    value: function removeImageSetAsAnnotated(userID, imageSetID) {
      var _this30 = this;

      var SQL = "DELETE FROM ImageSet_annotated_by_User WHERE userID = ".concat(userID, " AND  imageSetID = ").concat(imageSetID, ";");
      return new Promise(function (resolve, reject) {
        _this30._db.get(SQL, [], function (err, row) {
          if (err) reject();else resolve();
        });
      });
    }
  }]);

  return DBHandler;
}();

exports["default"] = DBHandler;
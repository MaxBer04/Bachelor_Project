const sqlite = require('sqlite3').verbose();
const DATABASE_PATH = './database/database.db';


export default class DBHandler {
  constructor() {
    this._db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, (err) => {
      if(err) throw err;
      console.log("Connected to Database...");
    });
  }


  // CHECK
  isValidUser(email, password) {
    const SQL = `SELECT * FROM User WHERE passwordHash='${password}' AND email='${email}';`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        if(!row) {
          resolve('failed');
        } else {
          resolve('success');
        }
      });
    });
  }
  isAdmin(ID) {
    const SQL = `SELECT * FROM Admin WHERE userID=${ID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else if(row) resolve(true);
        else resolve(false);
      });
    });
  }
  isImageSetAnnotated(userID, imageSetID) {
    const SQL = `SELECT * FROM ImageSet_annotated_by_User WHERE userID = ${userID} AND  imageSetID = ${imageSetID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else if(row) resolve(true);
        else resolve(false);
      });
    });
  }
  isImageAnnotatedByUser(userID, imageID) {
    const SQL = `SELECT * FROM Image_annotated_by_User WHERE userID = ${userID} AND imageID = ${imageID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else if(row) resolve(true);
        else resolve(false);
      });
    });
  }


  // GET
  getIDByEmail(email) {
    const SQL = `SELECT ID FROM User WHERE email='${email}';`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(!row) reject(err);
        resolve(row.ID);
      });
    });
  }
  getUser(ID) {
    const SQL = `SELECT * FROM User WHERE ID=${ID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        resolve(row);
      });
    });
  }
  getUserByEmail(email) {
    const SQL = `SELECT * FROM User WHERE email='${email}';`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], (err, rows) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  }
  getFirstAndLastname(ID) {
    const SQL = `SELECT first_name, last_name FROM User WHERE ID=${ID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        resolve(row);
      })
    });
  }
  getAllUsers() {
    const SQL = 'SELECT * FROM User;';
    return new Promise((resolve, reject) => {
      let emails = []
      this._db.all(SQL, (err, rows) => {
        if(err) reject(err);
        else {
          rows.forEach((row) => {
            emails.push(row.email);
          });
          resolve(emails);
        }
      });
    });
  }
  getAnnotationsFromImage(userID, imageID) {
    const SQL = `SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ${imageID} AND ${userID} IN (SELECT userID FROM Image_annotated_by_User WHERE imageID = ${imageID} AND userID = ${userID});`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getAnnotationIDs(userID, imageID) {
    const SQL = `SELECT ID FROM Annotation WHERE imageID = ${imageID} AND imageID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID = ${userID});`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getAttributesFromAnnotation(annotationID) {
    const SQL = `SELECT ID, text FROM Attribut WHERE annotationID = ${annotationID};`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getPointsFromAnnotation(annotationID) {
    const SQL = `SELECT X, Y FROM Point WHERE annotationID = ${annotationID};`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getImagePathAndTypFromSet(imageSetID) {
    const SQL = `SELECT path,type FROM Image WHERE imageSetID = ${imageSetID};`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getImageSetTitle(imageSetID) {
    const SQL = `SELECT title FROM ImageSet WHERE ID = ${imageSetID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        else resolve(row);
      });
    });
  }
  getImageIDAndPathFromSet(imageSetID) {
    const SQL = `SELECT ID,path FROM Image WHERE imageSetID=${imageSetID};`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve(rows);
      });
    });
  }
  getAllImageSets() {
    const SQL = 'SELECT * FROM ImageSet;';
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], function(err, rows) {
        if(err) reject(err)
        else {
          const IDs = [];
          for(let i = 0; i < rows.length; i++) IDs.push(rows[i].ID);
          resolve(rows);
        }
      });
    });
  }


  // ADD / CREATE
  createNewImageSet(title) {
    const currentdate = new Date();
    const SQL = `INSERT INTO ImageSet(ID, title, upload_date) VALUES(null, '${title}', '${currentdate.toISOString()}');`
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve(this.lastID);
      });
    });
  }
  addAttributeToAnnotation(annotationID, attribute) {
    const SQL = `INSERT INTO Attribut(ID, annotationID, text) VALUES (null, ${annotationID}, '${attribute._content}');`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  newAnnotationByUser(userID, imageID) {
    const currentdate = new Date();
    const SQL = `INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (${imageID}, ${userID}, '${currentdate.toISOString()}');`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  addUser(user) {
    const SQL = `INSERT INTO User(email, passwordHash, ID, verified, first_name, last_name) VALUES(
      '${user.email}', '${user.password}', null, null, '${user.firstName}', '${user.lastName}');
      `;
      return new Promise((resolve, reject) => {
        this._db.exec(SQL,(error) => {
          if(error) throw error;
          resolve();
        });
      });
  }
  addAnnotationToImage(imageID, polygon) {
    const SQL = `INSERT INTO Annotation(ID, imageID, shape, text, color, name) VALUES (null, ${imageID}, '${polygon._shape}', '${polygon._text}', '${polygon._fillColor}', '${polygon._name}');`
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve(this.lastID);
      });
    });
  }
  addPointToAnnotation(annotationID, point) {
    const SQL = `INSERT INTO Point(ID, X, Y, annotationID) VALUES (null, ${point.X}, ${point.Y}, ${annotationID})`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  addImageToImageSet(imageURL, imageSetID, type) {
    const SQL = `INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ${imageSetID}, '${imageURL}', '${type}');`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve(this.lastID);
      });
    });
  }
  markImageSetAsAnnotated(userID, imageSetID) {
    const currentdate = new Date();
    const SQL = `INSERT INTO ImageSet_annotated_by_User(imageSetID, userID, timestamp) VALUES (${imageSetID}, ${userID}, '${currentdate.toISOString()}');`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err) {
        if(err) reject(err)
        else resolve();
      });
    });
  }


  // DELETE 
  deleteAllAnnotationsForImage(userID, imageID) {
    const SQL = `DELETE FROM Annotation WHERE imageID = ${imageID} AND imageID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID = ${userID});`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  deletePoints(annotationID) {
    const SQL = `DELETE FROM Point WHERE annotationID = ${annotationID};`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  deleteAttributes(annotationID) {
    const SQL = `DELETE FROM Attribut WHERE annotationID = ${annotationID};`;
    return new Promise((resolve, reject) => {
      this._db.run(SQL, [], function(err, rows) {
        if(err) reject(err)
        else resolve();
      });
    });
  }
  removeImageAsAnnotated(userID, imageID) {
    const SQL = `DELETE FROM Image_annotated_by_User WHERE userID = ${userID} AND  imageID = ${imageID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else resolve();
      });
    });
  }
  removeImageSetAsAnnotated(userID, imageSetID) {
    const SQL = `DELETE FROM ImageSet_annotated_by_User WHERE userID = ${userID} AND  imageSetID = ${imageSetID};`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else resolve();
      });
    });
  }
}
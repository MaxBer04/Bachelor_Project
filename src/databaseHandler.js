const sqlite = require('sqlite3').verbose();
const utf8 = require('utf8');
const DATABASE_PATH = './database/database.db';


export default class DBHandler {
  constructor() {
    this._db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, (err) => {
      if(err) throw err;
      console.log("Connected to Database...");
    });
  }

  close() {
    this._db.close((err) => {
      if(err) throw err;
      else console.log("Disconnected from Database...");
    });
  }


  // CHECK
  isValidUser(email, password) {
    const SQL = 'SELECT * FROM User WHERE passwordHash = ? AND email = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([password, email], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        if(!row) {
          statement.finalize();
          resolve('failed');
        } else {
          statement.finalize();
          resolve('success');
        }
      });
    });
  }
  isVerified(userID) {
    const SQL = 'SELECT * FROM User WHERE ID = ? AND verified = 1;'
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([userID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else if(row) {
          statement.finalize();
          resolve(true);
        }
        else {
          statement.finalize();
          resolve(false);
        }
      });
    });
  }
  isAdmin(userID) {
    const SQL = 'SELECT * FROM Admin WHERE userID = ?;'
    return new Promise((resolve, reject) => {
      const statement= this._db.prepare(SQL);
      statement.get([userID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else if(row) {
          statement.finalize();
          resolve(true);
        }
        else {
          statement.finalize();
          resolve(false);
        }
      });
    });
  }
  isImageSetAnnotated(userID, imageSetID) {
    const SQL = 'SELECT * FROM ImageSet_annotated_by_User WHERE userID = ? AND imageSetID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([userID, imageSetID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else if(row) {
          statement.finalize();
          resolve(true);
        }
        else {
          statement.finalize();
          resolve(false);
        }
      });
    });
  }
  isImageAnnotatedByUser(userID, imageID) {
    //const SQL = `SELECT * FROM Image_annotated_by_User WHERE userID = ${userID} AND imageID = ${imageID};`;
    const SQL = 'SELECT * FROM Image_annotated_by_User WHERE userID = ? AND imageID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([userID, imageID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else if(row) {
          statement.finalize();
          resolve(true);
        }
        else {
          statement.finalize();
          resolve(false);
        }
      });
    });
  }


  // GET
  async getSetsByUserAnnotations(userEmails, mode) {
    const resultSets = [];
    const userIDs = [];
    for(let i = 0; i < userEmails.length; i++) {
      const ID = await this.getIDByEmail(userEmails[i]);
      userIDs.push(ID);
    }
    let SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User WHERE userID = ?)';
    for(let i = 1; i < userIDs.length; i++) {
      SQL += ' '+mode+' ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User WHERE userID = ?)'
    }
    SQL += ';';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all(userIDs, function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        for(let i = 0; i < rows.length; i++) resultSets.push(rows[i]);
        statement.finalize();
        resolve(resultSets);
      });
    });
  }
  
  getIDByEmail(email) {
    const SQL = 'SELECT ID FROM User WHERE email = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([email], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row.ID);
      });
    });
  }
  getEmailByID(ID) {
    //const SQL = `SELECT email FROM User WHERE ID='${ID}';`;
    const SQL = 'SELECT email FROM User WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([ID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row.email);
      });
    });
  }
  getIDsFromEmails(emails) {
    let SQL = 'SELECT ID FROM User WHERE email IN (?#);';
    SQL = this.arraySearch(SQL, emails);
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all(emails, function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }

  getAllUsers() {
    //const SQL = 'SELECT * FROM User;';
    const SQL = 'SELECT * FROM User;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], (err, rows) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAllUserEmails() {
    const SQL = 'SELECT * FROM User;';
    return new Promise((resolve, reject) => {
      let emails = []
      const statement = this._db.prepare(SQL);
      statement.all([],(err, rows) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          rows.forEach((row) => {
            emails.push(row.email);
          });
          statement.finalize();
          resolve(emails);
        }
      });
    });
  }
  getUser(ID) {
    const SQL = 'SELECT * FROM User WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([ID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }
  getUserByEmail(email) {
    const SQL = 'SELECT * FROM User WHERE email = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([email], (err, rows) => {
        if(err) {
          statement.finalize();        
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getFirstAndLastname(ID) {
    const SQL = 'SELECT first_name, last_name FROM User WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([ID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      })
    });
  }

  getAnnotatedImagesFromUsers(userIDs, setID, userMode) {
    let SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ? AND ID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID  = ?)';
    for(let i = 1; i < userIDs.length; i++) {
      SQL += ' '+userMode+' ID IN (SELECT imageID FROM Image_annotated_by_User WHERE userID  = ?)'
    }
    SQL += ';';
    let params = [setID].concat(userIDs);
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all(params, function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }

  getAllUserIDsForAnnotatedImage(imageID) {
    const SQL = 'SELECT userID FROM Image_annotated_by_User WHERE imageID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }

  getUserIDFromAnnotationID(annotationID) {
    const SQL = 'SELECT userID FROM Annotation WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([annotationID], function(err, row) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }
  getAnnotatedImagesFromSet(setID) {
    let SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ? AND ID IN (SELECT imageID FROM Image_annotated_by_User);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([setID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAnnotationsFromImage(userID, imageID) {
    const SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageID, userID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAllAnnotationsFromImage(imageID) {
    const SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE imageID = ?;'
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAllAnnotatedSets() {
    const SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM ImageSet_annotated_by_User);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      })
    })
  }
  getAnnotationIDs(userID, imageID) {
    const SQL = 'SELECT ID FROM Annotation WHERE imageID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageID, userID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAnnotationsByIDs(IDs) {
    let SQL = 'SELECT ID, shape, text, color, name FROM Annotation WHERE ID = ?';
    for(let i = 1; i < IDs.length; i++) {
      SQL += ' OR ID = ?'
    }
    SQL += ';';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([IDs], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAnnotationIDsByText(text) {
    let SQL = 'SELECT annotationID FROM Attribut WHERE text = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([text], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getImageFromAnnotationID(annotationID) {
    let SQL = 'SELECT ID, path FROM Image WHERE ID IN (SELECT imageID FROM Annotation WHERE ID = ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([annotationID], function(err, row) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }
  getAttributesFromAnnotation(annotationID) {
    const SQL = 'SELECT ID, text FROM Attribut WHERE annotationID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([annotationID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getPointsFromAnnotation(annotationID) {
    const SQL = 'SELECT X, Y FROM Point WHERE annotationID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([annotationID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getImagePathAndTypFromSet(imageSetID) {
    const SQL = 'SELECT path, type FROM Image WHERE imageSetID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageSetID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getImageSetTitle(imageSetID) {
    const SQL = 'SELECT title FROM ImageSet WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([imageSetID], (err, row) => {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }
  getImageIDAndPathFromSet(imageSetID) {
    const SQL = 'SELECT ID, path FROM Image WHERE imageSetID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([imageSetID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAnnotationDateForImage(imageID, userID) {
    const SQL = 'SELECT timestamp FROM Image_annotated_by_User WHERE imageID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([imageID, userID], function(err, row) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }
  getAllImageSetIDs() {
    const SQL = 'SELECT * FROM ImageSet;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          const IDs = [];
          for(let i = 0; i < rows.length; i++) IDs.push(rows[i].ID);
          statement.finalize();
          resolve(rows);
        }
      });
    });
  }
  getAllImageSets() {
    const SQL = 'SELECT * FROM ImageSet;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAllAttributesText() {
    const SQL = `SELECT text FROM Attribut;`;
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }
  getAllAttributes() {
    const SQL = `SELECT * FROM Attribut;`;
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(rows);
      });
    });
  }

  getSetsByID(setIDs) {
    const resultSets = [];
    let SQL = 'SELECT * FROM ImageSet WHERE ID IN (?#);';
    SQL = this.arraySearch(SQL, setIDs);
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.all([setIDs], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        for(let i = 0; i < rows.length; i++) resultSets.push(rows[i]);
        statement.finalize();
        resolve(resultSets);
      });
    });
  }
  getSetByImageID(imageID) {
    let SQL = 'SELECT * FROM ImageSet WHERE ID IN (SELECT imageSetID FROM Image WHERE ID = ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([imageID], function(err, row) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve(row);
      });
    });
  }

  // HELPER
  arraySearch(sql, arr) {
    return sql.replace('?#', arr.map(() => '?' ).join(','))
  }
  


  // ADD / CREATE
  createNewImageSet(title) {
    const currentdate = new Date();
    const SQL = 'INSERT INTO ImageSet(ID, title, upload_date) VALUES(null, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([title, currentdate.toISOString()], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve(this.lastID);
        }
      });
      
    });
  }
  addAttributesToAnnotation(annotationID, attributes) {
    const SQL = `INSERT INTO Attribut(ID, annotationID, text) VALUES (null, ?, ?);`;
    return new Promise((resolve, reject) => {
      this._db.serialize(function() {
        const statement = this.prepare(SQL);
        for(let i = 0; i < attributes.length; i++) {
          statement.run([annotationID, attributes[i]._content], function(err, row) {
            if(err) {
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
  newAnnotationByUser(userID, imageID) {
    const currentdate = new Date();
    const SQL = 'INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (?, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageID, userID, currentdate.toISOString()], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  addUser(user) {
    const SQL = 'INSERT INTO User(email, passwordHash, ID, verified, first_name, last_name) VALUES (?, ?, null, null, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([user.email, user.password, user.firstName, user.lastName], function(error) {
        if(error) {
          statement.finalize();
          reject(error);
        }
        else {
          statement.finalize();
          resolve(this.lastID);
        }
      });
    });
  }
  addAnnotationToImage(imageID, userID, polygon) {
    const SQL = 'INSERT INTO Annotation(ID, imageID, userID, shape, text, color, name) VALUES (null, ?, ?, ?, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageID, userID, polygon._shape, polygon._text, polygon._fillColor, polygon._name], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve(this.lastID);
        }
      });
    });
  }
  addPointsToAnnotation(annotationID, points) {
    let SQL = `INSERT INTO Point(ID, X, Y, annotationID) VALUES (null, ?, ?, ?);`;
    return new Promise((resolve, reject) => {
      this._db.serialize(function() {
        const statement = this.prepare(SQL);
        for(let i = 0; i < points.length; i++) {
          statement.run([points[i].X, points[i].Y, annotationID], function(err, row) {
            if(err) {
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
  addImageToImageSet(imageURL, imageSetID, type) {
    const SQL = 'INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageSetID, imageURL, type], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve(this.lastID);
        }
      });
    });
  }
  addImagesToImageSet(imageSetID, images) {
    const SQL = 'INSERT INTO Image(ID, imageSetID, path, type) VALUES(null, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      this._db.serialize(function() {
        const statement = this.prepare(SQL);
        for(let i = 0; i < images.length; i++) {
          statement.run([imageSetID, images[i].path, images[i].type], function(err) {
            if(err) {
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
  markImageSetAsAnnotated(userID, imageSetID) {
    const currentdate = new Date();
    const SQL = 'INSERT INTO ImageSet_annotated_by_User(imageSetID, userID, timestamp) VALUES (?, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageSetID, userID, currentdate.toISOString()], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  markImageAsAnnotated(userID, imageID) {
    const currentdate = new Date();
    const SQL = 'INSERT INTO Image_annotated_by_User(imageID, userID, timestamp) VALUES (?, ?, ?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageID, userID, currentdate.toISOString()], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  setUserAsAdmin(userID) {
    const SQL = 'INSERT INTO Admin(userID) VALUES (?);';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([userID], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  setUserVerified(userID) {
    const SQL = 'UPDATE User SET verified = true WHERE ID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([userID], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }


  // DELETE 
  deleteAllAnnotationsForImage(userID, imageID) {
    const SQL = 'DELETE FROM Annotation WHERE imageID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([imageID, userID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  deletePoints(annotationID) {
    const SQL = 'DELETE FROM Point WHERE annotationID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([annotationID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  deleteAttributes(annotationID) {
    const SQL = 'DELETE FROM Attribut WHERE annotationID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([annotationID], function(err, rows) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  removeImageAsAnnotated(userID, imageID) {
    const SQL = 'DELETE FROM Image_annotated_by_User WHERE userID = ? AND imageID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([userID, imageID], (err, row) => {
        if(err) {
          statement.finalize();
          reject();
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }
  removeImageSetAsAnnotated(userID, imageSetID) {
    //const SQL = `DELETE FROM ImageSet_annotated_by_User WHERE userID = ${userID} AND  imageSetID = ${imageSetID};`;
    const SQL = 'DELETE FROM ImageSet_annotated_by_User WHERE userID = ? AND imageSetID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.get([userID, imageSetID], (err, row) => {
        if(err) {
          statement.finalize();
          reject();
        }
        else {
          statement.finalize();
          resolve();
        }
      });
    });
  }


  // UPDATE
  updateAnnotationTimestampForImageSet(imageSetID, userID, currentDateISO) {
    const SQL = 'UPDATE ImageSet_annotated_by_User SET timestamp = ? WHERE imageSetID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([currentDateISO, imageSetID, userID], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve();
      });
    });
  }

updateAnnotationTimestampForImage(imageID, userID, currentDateISO) {
  const SQL = 'UPDATE Image_annotated_by_User SET timestamp = ? WHERE imageID = ? AND userID = ?;';
    return new Promise((resolve, reject) => {
      const statement = this._db.prepare(SQL);
      statement.run([currentDateISO, imageID, userID], function(err) {
        if(err) {
          statement.finalize();
          reject(err);
        }
        statement.finalize();
        resolve();
      });
    });
  }
}
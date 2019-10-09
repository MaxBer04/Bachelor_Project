import { resolve } from 'url';


const sqlite = require('sqlite3').verbose();
const DATABASE_PATH = './database/database.db';


export default class DBHandler {
  constructor() {
    this._db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, (err) => {
      if(err) throw err;
      console.log("Connected to Database...");
    });
  }

  getIDByEmail(email) {
    const SQL = `SELECT ID FROM User WHERE email='${email}'`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(!row) reject(err);
        resolve(row.ID);
      });
    });
  }
  getUser(ID) {
    const SQL = `SELECT * FROM User WHERE ID=${ID}`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        resolve(row);
      });
    });
  }
  getUserByEmail(email) {
    const SQL = `SELECT * FROM User WHERE email='${email}'`;
    return new Promise((resolve, reject) => {
      this._db.all(SQL, [], (err, rows) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  }

  getFirstAndLastname(ID) {
    const SQL = `SELECT first_name, last_name FROM User WHERE ID=${ID}`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject(err);
        resolve(row);
      })
    });
  }

  getAllUsers() {
    const SQL = 'SELECT * FROM User';
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

  addUser(user) {
    const SQL = `INSERT INTO user(email, passwordHash, ID, Coverbild, verified, first_name, last_name) VALUES(
      '${user.username}', '${user.password}', null, null, null, '${user.firstName}', '${user.lastName}');
      `;
      return new Promise((resolve, reject) => {
        this._db.exec(SQL,(error) => {
          if(error) throw error;
          resolve();
        });
      });
  }

  isValidUser(email, password) {
    const SQL = `SELECT * FROM User WHERE passwordHash='${password}' AND email='${email}'`;
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

  checkIfAdmin(ID) {
    const SQL = `SELECT * FROM Admin WHERE userID=${ID}`;
    return new Promise((resolve, reject) => {
      this._db.get(SQL, [], (err, row) => {
        if(err) reject();
        else if(row) resolve(true);
        else resolve(false);
      });
    });
  }
}
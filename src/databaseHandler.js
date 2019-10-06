import sqlite from 'sqlite3';
const DATABASE_PATH = './database/database.db';


export default class DBHandler {
  constructor() {
    this._db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, (err) => {
      if(err) throw err;
      console.log("Connected to Database...");
    });
  }

  getIDByEmail(email) {
    const SQL = `SELECT ID FROM User WHERE email=${email}`;
    this._db.get(SQL, [], (err, row) => {
      if(err) throw err;
      return row.email;
    });
  }
}
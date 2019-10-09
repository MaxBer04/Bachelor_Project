import createError from 'http-errors';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
const sqlite = require('sqlite3').verbose();
//import loginHandler from '/loginHandler.js';


import securedMainRouter from './routes/securedMain.js';
import mainRouter from './routes/main.js';
import loginRouter from './routes/login.js';

const DATABASE_PATH = './database/database.db';

const app = express();
let db = new sqlite.Database(DATABASE_PATH, sqlite.OPEN_READWRITE, (err) => {
  if(err) throw err;
  //console.log("Connected to Database...");
});

db.serialize(() => {
  db.each('SELECT * FROM User', (err, row) => {
    if(err) console.error(err.message);
    //console.log(row.email+"\t"+row.first_name);
  });
});

/*db.close((err) => {
  if(err) throw err;
  console.log('Database connection closed.');
});*/


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',randomNumber, { maxAge: 9000000, httpOnly: true });
  }
  next();
});
app.use(express.static(path.join(__dirname, '../public')));

app.use('/main/secured', securedMainRouter);
app.use('/main', mainRouter);
app.use('/login', loginRouter);


app.get('/', (req, res) => {
  res.redirect('/main');
});

// catch 404 and forward to error handler 
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


export default app;

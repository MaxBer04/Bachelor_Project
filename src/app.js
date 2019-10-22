import createError from 'http-errors';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import DBHandler from './databaseHandler.js';
import {verifyToken, clearCookies, verifyAdminRequestNumber, verifyUser} from './routes/login.js';

import mainRouter from './routes/main.js';
import loginRouter from './routes/login.js';


const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const connections = [];


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/main', mainRouter);
app.use('/login', loginRouter);


app.get('/', (req, res) => {
  res.redirect('/main');
});


app.get('/verifyAsAdmin/:number/:userID', async (req, res) => {
  if(verifyAdminRequestNumber(Number(req.params.number))) {
    const dbHandler = new DBHandler();
    await dbHandler.setUserVerified(req.params.userID);
    await dbHandler.setUserAsAdmin(req.params.userID);
    dbHandler.close();
    res.status(200).send();
  }
  else res.status(500).send();
});

app.get('/verify/:number/:userID', async (req, res) => {
  if(verifyUser(Number(req.params.number))) {
    const dbHandler = new DBHandler();
    await dbHandler.setUserVerified(req.params.userID);
    dbHandler.close()
    res.status(200).send();
  }
  else res.status(500).send();
});

app.get('/logout', verifyToken, (req,res) => {
  unlockImagesByUserID(req.cookies.ID);
  clearCookies(res);
  res.redirect('http://localhost:3000/login');
})

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

server.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port 3000...");
})

const lockList = [];

function unlockImagesByUserID(userID) {
  let imageIDs = [];
  for(let i = lockList.length - 1; i >= 0; i--) {
    if(lockList[i].ID === userID) {
      imageIDs.push(lockList[i].imageID);
      lockList.splice(i, 1);
    }
  }

  for(let i = 0; i < imageIDs.length; i++) {
    const imageID = imageIDs[i];
    io.emit('confirmedUnlock', {imageID});
  }
  console.clear();
  console.log("LOCKLIST: ");
  console.log(lockList);
}

function isImageAlreadyLocked(imageID) {
  if(lockList.length !== 0){
    for(let i = 0; i < lockList.length; i++) {
      if(lockList[i].imageID === imageID) return true;
    } 
  } else return false;
}

io.sockets.on('connection', function(socket) {
  /*let cookie = socket.request.headers.cookie;
  let ID = cookie.slice(cookie.indexOf("ID=")+3, cookie.length);
  ID = ID.slice(0, ID.indexOf(";"));
  socket.join(`Room:${ID}`);
  console.log(io.sockets.adapter.rooms);*/

  connections.push(socket);
  console.log('Connected: %s sockets connected...', connections.length);

  // Disconnect
  socket.on('disconnect', function(data) {
    let cookie = socket.request.headers.cookie;
    let ID = cookie.slice(cookie.indexOf("ID=")+3, cookie.length);
    ID = ID.slice(0, ID.indexOf(";"));
    unlockImagesByUserID(ID);
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected...', connections.length);
  });
  socket.on('lock', function(imageID) {
    if(!isImageAlreadyLocked(imageID)) {
      let cookie = socket.request.headers.cookie;
      let firstName = cookie.slice(cookie.indexOf("firstName=")+10, cookie.length);
      firstName = firstName.slice(0, firstName.indexOf(";"));
      let lastName = cookie.slice(cookie.indexOf("lastName=")+9, cookie.length);
      lastName = lastName.slice(0, lastName.indexOf(";"));
      let ID = cookie.slice(cookie.indexOf("ID=")+3, cookie.length);
      ID = ID.slice(0, ID.indexOf(";"));
      lockList.push({imageID, firstName, lastName, ID});
      socket.broadcast.emit('confirmedLock', {imageID, firstName, lastName});
    }
  });
  socket.on('unlock', function(imageID) {
    for(let i = lockList.length - 1; i >= 0; i--) {
      if(lockList[i].imageID === imageID) lockList.splice(i,1);
    }
    socket.broadcast.emit('confirmedUnlock', {imageID});
  });
  socket.on('getLockedList', function() {
    socket.emit('acceptLockedList', lockList);
  })
});


export default app;

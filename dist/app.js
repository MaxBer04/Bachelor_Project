#!/usr/bin/env node
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUploadSocket = getUploadSocket;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _fs = _interopRequireDefault(require("fs"));

var _https = _interopRequireDefault(require("https"));

var _cookie = _interopRequireDefault(require("cookie"));

var _databaseHandler = _interopRequireDefault(require("./databaseHandler.js"));

var _login = _interopRequireWildcard(require("./routes/login.js"));

var _main = _interopRequireDefault(require("./routes/main.js"));

var _searchSets = _interopRequireDefault(require("./routes/searchSets.js"));

//const privateSSLKey = fs.readFileSync(__dirname + '/SSL/server.key', 'utf8');
//const certificate = fs.readFileSync(__dirname + '/SSL/server.crt', 'utf8');
//const credentials = {key: privateSSLKey, cert: certificate, requestCert: false, rejectUnauthorized: false};
var app = (0, _express["default"])(); //const server = https.createServer(credentials, app);

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

var connections = [];
/*const copyNodeModules = require('copy-node-modules');
const srcDir = '/home/max/Dropbox/COMP UNI/BachelorArbeit/Sketches/Bachelor_Project';
const dstDir = '/media/max/Samsung_T5/Bachelor_Project';
copyNodeModules(srcDir, dstDir, { devDependencies: true }, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  Object.keys(results).forEach(name => {
    const version = results[name];
    console.log(`Package name: ${name}, version: ${version}`);
  });
});*/
// view engine setup

app.set('views', _path["default"].join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use((0, _morgan["default"])('dev'));
app.use(_bodyParser["default"].urlencoded({
  extended: true,
  limit: '50000000mb'
}));
app.use(_bodyParser["default"].json({
  limit: '50000000mb'
}));
app.use((0, _cookieParser["default"])());
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;

  if (cookie === undefined) {
    // set a new cookie
    var randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    res.cookie('cookieName', randomNumber, {
      maxAge: 9000000,
      httpOnly: true
    });
  }

  next();
});
app.use('/uploads', _express["default"]["static"](_path["default"].join(__dirname, '/../uploads')));
app.use(_express["default"]["static"](_path["default"].join(__dirname, '../public')));
app.use('/main', _main["default"]);
app.use('/main/search', _searchSets["default"]);
app.use('/login', _login["default"]);
app.get('/', function (req, res) {
  res.redirect('/main');
});
app.get('/verifyAsAdmin/:number/:userID', function _callee(req, res) {
  var dbHandler;
  return _regenerator["default"].async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator["default"].awrap((0, _login.verifyAdminRequestNumber)(Number(req.params.number), Number(req.params.userID)));

        case 2:
          if (!_context.sent) {
            _context.next = 12;
            break;
          }

          dbHandler = new _databaseHandler["default"]();
          _context.next = 6;
          return _regenerator["default"].awrap(dbHandler.setUserVerified(req.params.userID));

        case 6:
          _context.next = 8;
          return _regenerator["default"].awrap(dbHandler.setUserAsAdmin(req.params.userID));

        case 8:
          dbHandler.close();
          res.status(200).send();
          _context.next = 13;
          break;

        case 12:
          res.status(500).send();

        case 13:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.get('/verify/:number/:userID', function _callee2(req, res) {
  var dbHandler;
  return _regenerator["default"].async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _regenerator["default"].awrap((0, _login.verifyUser)(Number(req.params.number), Number(req.params.userID)));

        case 2:
          if (!_context2.sent) {
            _context2.next = 10;
            break;
          }

          dbHandler = new _databaseHandler["default"]();
          _context2.next = 6;
          return _regenerator["default"].awrap(dbHandler.setUserVerified(req.params.userID));

        case 6:
          dbHandler.close();
          res.status(200).send();
          _context2.next = 11;
          break;

        case 10:
          res.status(500).send();

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.get('/logout', _login.verifyToken, function (req, res) {
  unlockImagesByUserID(req.user.ID);
  (0, _login.clearCookies)(res);
  res.redirect("".concat(req.protocol, "://").concat(req.hostname, ":3000/login"));
}); // catch 404 and forward to error handler 

app.use(function (req, res, next) {
  next((0, _httpErrors["default"])(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
server.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port 3000...");
});
var lockList = [];

function unlockImagesByUserID(userID) {
  var imageIDs = [];

  for (var i = lockList.length - 1; i >= 0; i--) {
    if (lockList[i].ID === userID) {
      imageIDs.push(lockList[i].imageID);
      lockList.splice(i, 1);
    }
  }

  for (var _i = 0; _i < imageIDs.length; _i++) {
    var imageID = imageIDs[_i];
    io.emit('confirmedUnlock', {
      imageID: imageID
    });
  }

  console.log("LOCKLIST: ");
  console.log(lockList);
}

function isImageAlreadyLocked(imageID) {
  if (lockList.length !== 0) {
    for (var i = 0; i < lockList.length; i++) {
      if (lockList[i].imageID === imageID) return true;
    }
  } else return false;
}

var uploaderSocket;

function getUploadSocket(message) {
  return uploaderSocket;
}

io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected...', connections.length); // Disconnect

  socket.on('disconnect', function (data) {
    var cookie = _cookie["default"].parse(socket.request.headers.cookie);

    var user = (0, _login.verifyTokenSocket)(cookie.token);
    unlockImagesByUserID(user.ID);
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected...', connections.length);
  });
  socket.on('lock', function (imageID) {
    if (!isImageAlreadyLocked(imageID)) {
      var cookie = _cookie["default"].parse(socket.request.headers.cookie);

      var user = (0, _login.verifyTokenSocket)(cookie.token);
      var firstName = user.firstName;
      var lastName = user.lastName;
      lockList.push({
        imageID: imageID,
        firstName: firstName,
        lastName: lastName,
        ID: user.ID
      });
      socket.broadcast.emit('confirmedLock', {
        imageID: imageID,
        firstName: firstName,
        lastName: lastName
      });
    }
  });
  socket.on('unlock', function (imageID) {
    for (var i = lockList.length - 1; i >= 0; i--) {
      if (lockList[i].imageID === imageID) lockList.splice(i, 1);
    }

    socket.broadcast.emit('confirmedUnlock', {
      imageID: imageID
    });
  });
  socket.on('getLockedList', function () {
    socket.emit('acceptLockedList', lockList);
  });
  socket.on('startingUpload', function () {
    uploaderSocket = this;
  });
});
var _default = app;
exports["default"] = _default;
#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _databaseHandler = _interopRequireDefault(require("./databaseHandler.js"));

var _login = _interopRequireWildcard(require("./routes/login.js"));

var _main = _interopRequireDefault(require("./routes/main.js"));

var _searchSets = _interopRequireDefault(require("./routes/searchSets.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = (0, _express["default"])();

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

var connections = []; // view engine setup

app.set('views', _path["default"].join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use((0, _morgan["default"])('dev'));
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use(_bodyParser["default"].json());
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
app.get('/verifyAsAdmin/:number/:userID',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    var dbHandler;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(0, _login.verifyAdminRequestNumber)(Number(req.params.number))) {
              _context.next = 10;
              break;
            }

            dbHandler = new _databaseHandler["default"]();
            _context.next = 4;
            return dbHandler.setUserVerified(req.params.userID);

          case 4:
            _context.next = 6;
            return dbHandler.setUserAsAdmin(req.params.userID);

          case 6:
            dbHandler.close();
            res.status(200).send();
            _context.next = 11;
            break;

          case 10:
            res.status(500).send();

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.get('/verify/:number/:userID',
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var dbHandler;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(0, _login.verifyUser)(Number(req.params.number))) {
              _context2.next = 8;
              break;
            }

            dbHandler = new _databaseHandler["default"]();
            _context2.next = 4;
            return dbHandler.setUserVerified(req.params.userID);

          case 4:
            dbHandler.close();
            res.status(200).send();
            _context2.next = 9;
            break;

          case 8:
            res.status(500).send();

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
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

io.sockets.on('connection', function (socket) {
  /*let cookie = socket.request.headers.cookie;
  let ID = cookie.slice(cookie.indexOf("ID=")+3, cookie.length);
  ID = ID.slice(0, ID.indexOf(";"));
  socket.join(`Room:${ID}`);
  console.log(io.sockets.adapter.rooms);*/
  connections.push(socket);
  console.log('Connected: %s sockets connected...', connections.length); // Disconnect

  socket.on('disconnect', function (data) {
    var cookie = socket.request.headers.cookie;
    var ID = cookie.slice(cookie.indexOf("ID=") + 3, cookie.length);
    ID = ID.slice(0, ID.indexOf(";"));
    unlockImagesByUserID(ID);
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected...', connections.length);
  });
  socket.on('lock', function (imageID) {
    if (!isImageAlreadyLocked(imageID)) {
      var cookie = socket.request.headers.cookie;
      var firstName = cookie.slice(cookie.indexOf("firstName=") + 10, cookie.length);
      firstName = firstName.slice(0, firstName.indexOf(";"));
      var lastName = cookie.slice(cookie.indexOf("lastName=") + 9, cookie.length);
      lastName = lastName.slice(0, lastName.indexOf(";"));
      var ID = cookie.slice(cookie.indexOf("ID=") + 3, cookie.length);
      ID = ID.slice(0, ID.indexOf(";"));
      lockList.push({
        imageID: imageID,
        firstName: firstName,
        lastName: lastName,
        ID: ID
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
});
var _default = app;
exports["default"] = _default;
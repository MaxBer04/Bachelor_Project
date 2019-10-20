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

var _main = _interopRequireDefault(require("./routes/main.js"));

var _login = _interopRequireDefault(require("./routes/login.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
    // no: set a new cookie
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
app.use('/login', _login["default"]);
app.get('/', function (req, res) {
  res.redirect('/main');
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
io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected...', connections.length); // Disconnect

  connections.splice(connections.indexOf(socket), 1);
  console.log('Disconnected: %s sockets connected...', connections.length);
});
var _default = app;
exports["default"] = _default;
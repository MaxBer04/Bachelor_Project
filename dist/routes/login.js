"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAdmin = isAdmin;
exports.verifyToken = verifyToken;
exports.clearCookies = clearCookies;
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _fs = _interopRequireDefault(require("fs"));

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var _base64url = _interopRequireDefault(require("base64url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var url = require('url');

var router = _express["default"].Router();

var urlencodedParser = _bodyParser["default"].urlencoded({
  extended: false
});

router.use(isLoggedIn);
var TOKEN_TIMEOUT = 5000;
var dbHandler = new _databaseHandler["default"]();

var privateKEY = _fs["default"].readFileSync('./database/jwtRS256.key', 'utf8');

var publicKEY = _fs["default"].readFileSync('./database/jwtRS256.key.pub', 'utf8');
/*const signOptionsVerify = {
  issuer:  i,
  subject:  s,
  audience:  a,
  expiresIn:  "12h",
  algorithm:  ["RS256"]
}*/


router.get('/', function (req, res, next) {
  res.render('login');
});
router.post('/loginAttempt',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    var user, status;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            user = {
              email: req.body.email,
              password: req.body.password
            };
            _context.next = 4;
            return dbHandler.isValidUser(user.email, _base64url["default"].encode(user.password));

          case 4:
            status = _context.sent;

            if (!(status === 'success')) {
              _context.next = 10;
              break;
            }

            _context.next = 8;
            return logIn(user, res, false);

          case 8:
            _context.next = 12;
            break;

          case 10:
            res.set("status", status);
            res.send();

          case 12:
            _context.next = 19;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);
            res.set("status", "failed");
            res.send();

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 14]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/signUp',
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res, next) {
    var user;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            user = {
              email: req.body.email,
              password: _base64url["default"].encode(req.body.password),
              firstName: req.body.first_name,
              lastName: req.body.last_name
            };
            _context2.next = 4;
            return dbHandler.addUser(user);

          case 4:
            _context2.next = 6;
            return logIn(user, res, true);

          case 6:
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);
            res.set("status", _context2.t0);
            res.send();

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 8]]);
  }));

  return function (_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());

function logIn(_x6, _x7, _x8) {
  return _logIn.apply(this, arguments);
}

function _logIn() {
  _logIn = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(user, res, newUser) {
    var _ref3, ID, isAdmin, token, _ref4, first_name, last_name;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return getIDandAdmin(user.email);

          case 2:
            _ref3 = _context3.sent;
            ID = _ref3.ID;
            isAdmin = _ref3.isAdmin;
            user.ID = ID;
            user.isAdmin = isAdmin;
            token = getToken(ID, isAdmin, {
              email: user.email,
              password: user.password
            });

            if (user.first_name) {
              _context3.next = 16;
              break;
            }

            _context3.next = 11;
            return dbHandler.getFirstAndLastname(ID);

          case 11:
            _ref4 = _context3.sent;
            first_name = _ref4.first_name;
            last_name = _ref4.last_name;
            user.firstName = first_name;
            user.lastName = last_name;

          case 16:
            setCookieSession(res, token, user, newUser);
            res.redirect("/main");

          case 18:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _logIn.apply(this, arguments);
}

function isLoggedIn(req, res, next) {
  if (req.cookies.token) res.redirect("/main");else next();
}

function isAdmin(_x9, _x10, _x11) {
  return _isAdmin.apply(this, arguments);
}

function _isAdmin() {
  _isAdmin = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(req, res, next) {
    var isAdmin;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return dbHandler.isAdmin(req.cookies.ID);

          case 2:
            isAdmin = _context4.sent;
            if (isAdmin) next();else res.status(403).send("Only admins can upload Image Sets!");

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _isAdmin.apply(this, arguments);
}

function verifyToken(req, res, next) {
  var signOptions = {
    issuer: 'Heinrich Heine',
    subject: req.cookies.email,
    audience: '' + req.cookies.ID,
    expiresIn: TOKEN_TIMEOUT,
    algorithm: "RS256"
  };

  _jsonwebtoken["default"].verify(req.cookies.token, publicKEY, signOptions, function (err, decodedToken) {
    if (err !== null) {
      console.log("LOOGED OUT BECAUSE OF JWT VERIFY ERROR");
      clearCookies(res);
      res.redirect("http://localhost:3000/login");
    }

    next();
  });
}

function clearCookies(res) {
  res.clearCookie("token");
  res.clearCookie("email");
  res.clearCookie("ID");
  res.clearCookie("firstName");
  res.clearCookie("lastName");
}

function setCookieSession(res, token, user, newUser) {
  res.cookie("token", token);
  res.cookie("email", user.email);
  res.cookie("ID", user.ID);
  res.cookie("firstName", user.firstName);
  res.cookie("lastName", user.lastName);
  if (newUser) res.cookie("newUser", "true");
}

function getIDandAdmin(email) {
  return new Promise(function (resolve, reject) {
    var results = {};
    dbHandler.getIDByEmail(email).then(function (ID) {
      results.ID = ID;
      return ID;
    })["catch"](function (error) {
      return reject("ERROR GETTING THE EMAIL BY ID. " + error);
    }).then(function (ID) {
      dbHandler.isAdmin(ID).then(function (isAdmin) {
        results.isAdmin = isAdmin;
        resolve(results);
      })["catch"](function (error) {
        return reject("CANNOT CHECK FOR ADMIN: " + error);
      });
    });
  });
}

function getToken(ID, isAdmin, user) {
  var payload = {
    isAdmin: isAdmin
  };
  var signOptions = {
    issuer: 'Heinrich Heine',
    subject: user.email,
    audience: '' + ID,
    expiresIn: TOKEN_TIMEOUT,
    algorithm: "RS256"
  };
  return _jsonwebtoken["default"].sign(payload, privateKEY, signOptions);
}

var _default = router;
exports["default"] = _default;
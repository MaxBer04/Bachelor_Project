"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyUser = verifyUser;
exports.verifyAdminRequestNumber = verifyAdminRequestNumber;
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

var _nodemailer = _interopRequireDefault(require("nodemailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var url = require('url');

var router = _express["default"].Router();

var urlencodedParser = _bodyParser["default"].urlencoded({
  extended: false
});

router.use(isLoggedIn);
var ADMIN_EMAIL = 'kbertram6@googlemail.com';
var VERIFICATION_LINK_START = "http://localhost:3000";
var dbHandler = new _databaseHandler["default"]();

var privateKEY = _fs["default"].readFileSync('./database/jwtRS256.key', 'utf8');

var publicKEY = _fs["default"].readFileSync('./database/jwtRS256.key.pub', 'utf8');

var adminNumbers = [];
var verifyNumbers = [];
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
            _context.next = 11;
            break;

          case 10:
            res.redirect('/login');

          case 11:
            _context.next = 18;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);
            res.set("status", "failed");
            res.send();

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 13]]);
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
            user.ID = _context2.sent;
            if (req.body.adminCheck === "on") sendAdminRequest(user);else sendVerificationRequest(user);
            _context2.next = 8;
            return logIn(user, res, true);

          case 8:
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](0);
            res.redirect('/login');

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 10]]);
  }));

  return function (_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());

function verifyUser(number) {
  if (verifyNumbers.includes(number)) {
    verifyNumbers.splice(verifyNumbers.indexOf(number), 1);
    return true;
  } else return false;
}

function verifyAdminRequestNumber(number) {
  if (adminNumbers.includes(number)) {
    adminNumbers.splice(adminNumbers.indexOf(number), 1);
    return true;
  } else return false;
}

function sendVerificationRequest(_x6) {
  return _sendVerificationRequest.apply(this, arguments);
}

function _sendVerificationRequest() {
  _sendVerificationRequest = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(user) {
    var transporter, randomNumber, mailOptions;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            transporter = _nodemailer["default"].createTransport({
              service: 'gmail',
              auth: {
                user: 'annotationapphhu@gmail.com',
                pass: 'bachelorHHU20'
              }
            });
            randomNumber = Math.floor(Math.random() * 9000) + 1000;
            verifyNumbers.push(randomNumber);
            mailOptions = {
              from: 'annotationapphhu@gmail.com',
              to: ADMIN_EMAIL,
              subject: 'Verification HHU Annotation App',
              text: "A user is trying to verify itsself!   \nEmail: ".concat(user.email, "\nFirst name: ").concat(user.firstName, "\nLast name: ").concat(user.lastName, "  \nIf you want to verify this person please click this link:   \n").concat(VERIFICATION_LINK_START, "/verify/").concat(randomNumber, "/").concat(user.ID)
            };
            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.error(err);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _sendVerificationRequest.apply(this, arguments);
}

function sendAdminRequest(_x7) {
  return _sendAdminRequest.apply(this, arguments);
}

function _sendAdminRequest() {
  _sendAdminRequest = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(user) {
    var transporter, randomNumber, mailOptions;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            transporter = _nodemailer["default"].createTransport({
              service: 'gmail',
              auth: {
                user: 'annotationapphhu@gmail.com',
                pass: 'bachelorHHU20'
              }
            });
            randomNumber = Math.floor(Math.random() * 9000) + 1000;
            adminNumbers.push(randomNumber);
            mailOptions = {
              from: 'annotationapphhu@gmail.com',
              to: ADMIN_EMAIL,
              subject: 'Admin Verification HHU Annotation App',
              text: "A user is trying to become an Admin for the App!   \nEmail: ".concat(user.email, "\nFirst name: ").concat(user.firstName, "\nLast name: ").concat(user.lastName, "  \nIf you want to verify this person as an Admin, please click this link:   \n").concat(VERIFICATION_LINK_START, "/verifyAsAdmin/").concat(randomNumber, "/").concat(user.ID)
            };
            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.error(err);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _sendAdminRequest.apply(this, arguments);
}

function logIn(_x8, _x9, _x10) {
  return _logIn.apply(this, arguments);
}

function _logIn() {
  _logIn = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(user, res, newUser) {
    var _ref3, ID, isAdmin, _ref4, first_name, last_name, token;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return getIDandAdmin(user.email);

          case 2:
            _ref3 = _context5.sent;
            ID = _ref3.ID;
            isAdmin = _ref3.isAdmin;
            user.ID = ID;
            user.isAdmin = isAdmin;

            if (user.first_name) {
              _context5.next = 15;
              break;
            }

            _context5.next = 10;
            return dbHandler.getFirstAndLastname(ID);

          case 10:
            _ref4 = _context5.sent;
            first_name = _ref4.first_name;
            last_name = _ref4.last_name;
            user.firstName = first_name;
            user.lastName = last_name;

          case 15:
            token = getToken(ID, isAdmin, {
              email: user.email,
              password: user.password,
              firstName: user.firstName,
              lastName: user.lastName
            });
            setCookieSession(res, token, user, newUser);
            res.redirect("/main");

          case 18:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _logIn.apply(this, arguments);
}

function isLoggedIn(req, res, next) {
  if (req.cookies.token) res.redirect("/main");else next();
}

function isAdmin(_x11, _x12, _x13) {
  return _isAdmin.apply(this, arguments);
}

function _isAdmin() {
  _isAdmin = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(req, res, next) {
    var isAdmin;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return dbHandler.isAdmin(req.cookies.ID);

          case 2:
            isAdmin = _context6.sent;
            if (isAdmin) next();else res.status(403).send();

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _isAdmin.apply(this, arguments);
}

function verifyToken(req, res, next) {
  var signOptions = {
    issuer: 'Heinrich Heine Universität',
    subject: req.cookies.email,
    audience: '' + req.cookies.ID,
    //expiresIn: "12h",
    algorithm: "RS256"
  };

  _jsonwebtoken["default"].verify(req.cookies.token, publicKEY, signOptions, function (err, decodedToken) {
    if (err !== null) {
      console.log("LOOGED OUT BECAUSE OF JWT VERIFY ERROR");
      clearCookies(res);
      res.redirect("http://localhost:3000/login");
    }

    req.user = {
      ID: decodedToken.aud,
      isAdmin: decodedToken.isAdmin,
      email: decodedToken.sub,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName
    };
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
    isAdmin: isAdmin,
    lastName: user.lastName,
    firstName: user.firstName
  };
  console.log(payload);
  var signOptions = {
    issuer: 'Heinrich Heine Universität',
    subject: user.email,
    audience: '' + ID,
    //expiresIn: "12h",
    algorithm: "RS256"
  };
  return _jsonwebtoken["default"].sign(payload, privateKEY, signOptions);
}

var _default = router;
exports["default"] = _default;
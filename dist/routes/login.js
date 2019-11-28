"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyUser = verifyUser;
exports.verifyAdminRequestNumber = verifyAdminRequestNumber;
exports.isAdmin = isAdmin;
exports.verifyToken = verifyToken;
exports.verifyTokenSocket = verifyTokenSocket;
exports.clearCookies = clearCookies;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _fs = _interopRequireDefault(require("fs"));

var _databaseHandler = _interopRequireDefault(require("../databaseHandler.js"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

// This class handles the requests for the login screen, as well as the verification of users.
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
router.post('/loginAttempt', function _callee(req, res) {
  var user, status;
  return _regenerator["default"].async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          user = {
            email: req.body.email,
            password: req.body.password
          };
          _context.next = 4;
          return _regenerator["default"].awrap(dbHandler.isValidUser(user.email, user.password));

        case 4:
          status = _context.sent;

          if (!(status === 'success')) {
            _context.next = 10;
            break;
          }

          _context.next = 8;
          return _regenerator["default"].awrap(logIn(user, res, false));

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
  }, null, null, [[0, 13]]);
});
router.post('/signUp', function _callee2(req, res, next) {
  var verificationNumber, user;
  return _regenerator["default"].async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          verificationNumber = Math.floor(Math.random() * 9000) + 1000;
          user = {
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            verificationNumber: verificationNumber
          };
          _context2.next = 5;
          return _regenerator["default"].awrap(dbHandler.addUser(user));

        case 5:
          user.ID = _context2.sent;
          if (req.body.adminCheck === "on") sendAdminRequest(user);else sendVerificationRequest(user);
          _context2.next = 9;
          return _regenerator["default"].awrap(logIn(user, res, true));

        case 9:
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.redirect('/login');

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
});

function verifyUser(number, userID) {
  var verificationNumber;
  return _regenerator["default"].async(function verifyUser$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _regenerator["default"].awrap(dbHandler.getVerificationNumber(userID));

        case 2:
          verificationNumber = _context3.sent;

          if (!(verificationNumber === number)) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", true);

        case 7:
          return _context3.abrupt("return", false);

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function verifyAdminRequestNumber(number, userID) {
  var verificationNumber;
  return _regenerator["default"].async(function verifyAdminRequestNumber$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return _regenerator["default"].awrap(dbHandler.getVerificationNumber(userID));

        case 2:
          verificationNumber = _context4.sent;

          if (!(verificationNumber === number)) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", true);

        case 7:
          return _context4.abrupt("return", false);

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function sendVerificationRequest(user) {
  var transporter, mailOptions;
  return _regenerator["default"].async(function sendVerificationRequest$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          transporter = _nodemailer["default"].createTransport({
            service: 'gmail',
            auth: {
              user: 'annotationapphhu@gmail.com',
              pass: 'bachelorHHU20'
            }
          });
          mailOptions = {
            from: 'annotationapphhu@gmail.com',
            to: ADMIN_EMAIL,
            subject: 'Verification HHU Annotation App',
            text: "A user is trying to verify itsself!   \nEmail: ".concat(user.email, "\nFirst name: ").concat(user.firstName, "\nLast name: ").concat(user.lastName, "  \nIf you want to verify this person please click this link:   \n").concat(VERIFICATION_LINK_START, "/verify/").concat(user.verificationNumber, "/").concat(user.ID)
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.error(err);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        case 3:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function sendAdminRequest(user) {
  var transporter, mailOptions;
  return _regenerator["default"].async(function sendAdminRequest$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          transporter = _nodemailer["default"].createTransport({
            service: 'gmail',
            auth: {
              user: 'annotationapphhu@gmail.com',
              pass: 'bachelorHHU20'
            }
          });
          mailOptions = {
            from: 'annotationapphhu@gmail.com',
            to: ADMIN_EMAIL,
            subject: 'Admin Verification HHU Annotation App',
            text: "A user is trying to become an Admin for the App!   \nEmail: ".concat(user.email, "\nFirst name: ").concat(user.firstName, "\nLast name: ").concat(user.lastName, "  \nIf you want to verify this person as an Admin, please click this link:   \n").concat(VERIFICATION_LINK_START, "/verifyAsAdmin/").concat(user.verificationNumber, "/").concat(user.ID)
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.error(err);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        case 3:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function logIn(user, res, newUser) {
  var _ref, ID, isAdmin, _ref2, first_name, last_name, token;

  return _regenerator["default"].async(function logIn$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return _regenerator["default"].awrap(getIDandAdmin(user.email));

        case 2:
          _ref = _context7.sent;
          ID = _ref.ID;
          isAdmin = _ref.isAdmin;
          user.ID = ID;
          user.isAdmin = isAdmin;

          if (user.first_name) {
            _context7.next = 15;
            break;
          }

          _context7.next = 10;
          return _regenerator["default"].awrap(dbHandler.getFirstAndLastname(ID));

        case 10:
          _ref2 = _context7.sent;
          first_name = _ref2.first_name;
          last_name = _ref2.last_name;
          user.firstName = first_name;
          user.lastName = last_name;

        case 15:
          token = getToken(ID, isAdmin, user);
          setCookieSession(res, token, newUser);
          res.redirect("/main");

        case 18:
        case "end":
          return _context7.stop();
      }
    }
  });
}

function isLoggedIn(req, res, next) {
  if (req.cookies.token) res.redirect("/main");else next();
}

function isAdmin(req, res, next) {
  var isAdmin;
  return _regenerator["default"].async(function isAdmin$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return _regenerator["default"].awrap(dbHandler.isAdmin(req.user.ID));

        case 2:
          isAdmin = _context8.sent;
          if (isAdmin) next();else res.status(403).send();

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  });
}

function verifyToken(req, res, next) {
  var signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };

  try {
    _jsonwebtoken["default"].verify(req.cookies.token, publicKEY, signOptions, function (err, decodedToken) {
      if (err !== null) {
        console.log("LOOGED OUT BECAUSE JWT VERIFICATION FAILED!");
        clearCookies(res);
        res.redirect("http://localhost:3000/login"); // Wird für das Deployen der Applikation angepasst, sobald der Hostname verfügbar ist 
      }

      req.user = {
        ID: decodedToken.ID,
        isAdmin: decodedToken.isAdmin,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName
      };
      next();
    });
  } catch (error) {
    console.error(error);
  }
}

function verifyTokenSocket(token) {
  var signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };
  return _jsonwebtoken["default"].verify(token, publicKEY, signOptions, function (err, decodedToken) {
    if (err !== null) {
      console.log("LOOGED OUT BECAUSE OF JWT VERIFICATION ERROR!");
      clearCookies(res);
      res.redirect("http://localhost:3000/login"); // Wird für das Deployen der Applikation angepasst, sobald der Hostname verfügbar ist
    }

    var user = {
      ID: decodedToken.ID,
      isAdmin: decodedToken.isAdmin,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName
    };
    return user;
  });
}

function clearCookies(res) {
  res.clearCookie("token");
}

function setCookieSession(res, token, newUser) {
  res.cookie("token", token);
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
    ID: ID,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName
  };
  var signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };
  return _jsonwebtoken["default"].sign(payload, privateKEY, signOptions);
}

var _default = router;
exports["default"] = _default;
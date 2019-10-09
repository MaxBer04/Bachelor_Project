import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import DBHandler from '../databaseHandler.js';
import base64 from 'base64url';
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({extended:false});
router.use(isLoggedIn);


const dbHandler = new DBHandler();

const privateKEY  = fs.readFileSync('./database/jwtRS256.key', 'utf8');
const publicKEY  = fs.readFileSync('./database/jwtRS256.key.pub', 'utf8');

/*const signOptionsVerify = {
  issuer:  i,
  subject:  s,
  audience:  a,
  expiresIn:  "12h",
  algorithm:  ["RS256"]
}*/

router.get('/', (req, res, next)  =>{
  res.render('login');
});

router.get('/loginAttempt', (req, res)  =>{
  const user = {
    username: req.header('username'),
    password: req.header('password')
  }

  dbHandler.isValidUser(user.username, base64.encode(user.password)).then((status) => status).catch((error) => {throw error;})
  .then((status) => {
    if(status === 'success') {
      getIDandAdmin(user.username).then((values) => {
        const token = getToken(values.ID, values.isAdmin, user);
        return [token, values.ID];
      }).then((values) => {
          dbHandler.getFirstAndLastname(values[1]).then((row) => {
            user.firstName = row.first_name;
            user.lastName = row.last_name;
            setCookieSession(res, values[0], values[1], user);
            res.set("status", "success");
            res.render('index');
          });
        });
    } else {
      res.set("status", status);
      res.json({});
    }
  })
});


router.get('/signUp',  (req, res, next) => {
  const user = {
    username: req.header('username'),
    password: base64.encode(req.header('password')),
    firstName: req.header("firstName"),
    lastName: req.header("lastName")
  }

  dbHandler.addUser(user).then(() => {
    getIDandAdmin(user.username).then((values) => {
      const userPayload = {
        username: user.username,
        password: user.password
      }
      const token = getToken(values.ID, values.isAdmin, userPayload);
      setCookieSession(res, token, values.ID, user);
      res.set("status", "success");
      res.render('index');
    }).catch((error) => {
      res.set("status", error);
      res.json({});
    });
  }).catch((error) => {
    res.set("status", error);
    res.json({});
  });
});

function isLoggedIn(req, res, next) {
  if(req.cookies.token) res.redirect("/main");
  else next();
}

export function verifyToken(req, res, next) {
  const signOptions = {
    issuer: 'Heinrich Heine',
    subject: req.cookies.username,
    audience: ''+req.cookies.ID,
    expiresIn: "12h",
    algorithm: "RS256"
  };
  console.log(req.cookies);
  jwt.verify(req.cookies.token, publicKEY, signOptions, (err, decodedToken) => {
    if(err || (decodedToken.exp <= Date.now() / 1000)) {
      clearCookies(res);
      res.redirect("http://localhost:3000/login");
    }
    next();
  });
}

function clearCookies(res) {
  res.clearCookie("token");
  res.clearCookie("username");
  res.clearCookie("ID");
  res.clearCookie("firstName");
  res.clearCookie("lastName");
}

function setCookieSession(res, token, ID, user) {
  res.cookie("token", token);
  res.cookie("username", user.username);
  res.cookie("ID", ID);
  res.cookie("firstName", user.firstName);
  res.cookie("lastName", user.lastName);
}

function getIDandAdmin(username) {
  return new Promise( (resolve, reject) => {
    const results = {};
    dbHandler.getIDByEmail(username).then( (ID) => {
      results.ID = ID;
      return ID;
    }).catch((error) => reject("ERROR GETTING THE EMAIL BY ID. "+error))
      .then( (ID) => {
        dbHandler.checkIfAdmin(ID).then( (isAdmin) => {
          results.isAdmin = isAdmin;
          resolve(results);
        }).catch((error) => reject("CANNOT CHECK FOR ADMIN: "+error))
      })
  });
}

function getToken(ID, isAdmin, user) {
  const payload = {isAdmin};
  const signOptions = {
    issuer: 'Heinrich Heine',
    subject: user.username,
    audience: ''+ID,
    expiresIn: "12h",
    algorithm: "RS256"
  };
  return jwt.sign(payload, privateKEY, signOptions);
}

//const verifyToken = jwt.verify(token, publicKey, verifyOptions);


export default router;

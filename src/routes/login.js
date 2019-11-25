import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import DBHandler from '../databaseHandler.js';
import nodemailer from 'nodemailer';
const url = require('url');
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({extended:false});
router.use(isLoggedIn);

const ADMIN_EMAIL = 'kbertram6@googlemail.com';
const VERIFICATION_LINK_START = "http://localhost:3000";

const dbHandler = new DBHandler();

const privateKEY  = fs.readFileSync('./database/jwtRS256.key', 'utf8');
const publicKEY  = fs.readFileSync('./database/jwtRS256.key.pub', 'utf8');

const adminNumbers = [];
const verifyNumbers = []

router.get('/', (req, res, next)  =>{
  res.render('login');
});

router.post('/loginAttempt', async (req, res)  =>{
  try {
    const user = {
      email: req.body.email,
      password: req.body.password
    }

    const status = await dbHandler.isValidUser(user.email, user.password);
    if(status === 'success') {
      await logIn(user, res, false);
    } else {
      res.redirect('/login');
    }
  } catch(error) {
    console.error(error);
    res.set("status", "failed");
    res.send();
  }
});


router.post('/signUp', async (req, res, next) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.first_name,
      lastName: req.body.last_name
    }

    user.ID = await dbHandler.addUser(user);
    if((req.body.adminCheck === "on")) sendAdminRequest(user);
    else sendVerificationRequest(user);
    await logIn(user, res, true);
  } catch(error) {
    console.error(error);
    res.redirect('/login');
  }
});

export function verifyUser(number) {
  if(verifyNumbers.includes(number)) {
    verifyNumbers.splice(verifyNumbers.indexOf(number), 1);
    return true;
  }
  else return false;
}

export function verifyAdminRequestNumber(number) {
  if(adminNumbers.includes(number)) {
    adminNumbers.splice(adminNumbers.indexOf(number), 1);
    return true;
  }
  else return false;
}


async function sendVerificationRequest(user) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'annotationapphhu@gmail.com',
      pass: 'bachelorHHU20'
    }
  });
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  verifyNumbers.push(randomNumber);
  const mailOptions = {
    from: 'annotationapphhu@gmail.com',
    to: ADMIN_EMAIL,
    subject: 'Verification HHU Annotation App',
    text: `A user is trying to verify itsself!   
Email: ${user.email}
First name: ${user.firstName}
Last name: ${user.lastName}  
If you want to verify this person please click this link:   
${VERIFICATION_LINK_START}/verify/${randomNumber}/${user.ID}`
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendAdminRequest(user) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'annotationapphhu@gmail.com',
      pass: 'bachelorHHU20'
    }
  });
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  adminNumbers.push(randomNumber);
  const mailOptions = {
    from: 'annotationapphhu@gmail.com',
    to: ADMIN_EMAIL,
    subject: 'Admin Verification HHU Annotation App',
    text: `A user is trying to become an Admin for the App!   
Email: ${user.email}
First name: ${user.firstName}
Last name: ${user.lastName}  
If you want to verify this person as an Admin, please click this link:   
${VERIFICATION_LINK_START}/verifyAsAdmin/${randomNumber}/${user.ID}`
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

async function logIn(user, res, newUser) {
  const {ID, isAdmin} = await getIDandAdmin(user.email);
  user.ID = ID;
  user.isAdmin = isAdmin;
  if(!user.first_name) {
    const {first_name, last_name} = await dbHandler.getFirstAndLastname(ID);
    user.firstName = first_name;
    user.lastName = last_name;
  }
  const token = getToken(ID, isAdmin, user);
  setCookieSession(res, token, newUser);
  res.redirect(`/main`);
}


function isLoggedIn(req, res, next) {
  if(req.cookies.token) res.redirect("/main");
  else next();
}

export async function isAdmin(req, res, next) {
  const isAdmin = await dbHandler.isAdmin(req.user.ID);
  if(isAdmin) next();
  else res.status(403).send();
}

export function verifyToken(req, res, next) {
  const signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };
  jwt.verify(req.cookies.token, publicKEY, signOptions, (err, decodedToken) => {
    if(err !== null) {
      console.log("LOOGED OUT BECAUSE OF JWT VERIFY ERROR");
      clearCookies(res);
      res.redirect("http://localhost:3000/login");
    }
    req.user = {
      ID: decodedToken.ID,
      isAdmin: decodedToken.isAdmin,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName
    }
    next();
  });
}

export function verifyTokenSocket(token) {
  const signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };
  return jwt.verify(token, publicKEY, signOptions, (err, decodedToken) => {
    if(err !== null) {
      console.log("LOOGED OUT BECAUSE OF JWT VERIFY ERROR");
      clearCookies(res);
      res.redirect("http://localhost:3000/login");
    }
    let user = {
      ID: decodedToken.ID,
      isAdmin: decodedToken.isAdmin,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName
    }
    return user;
  });
}

export function clearCookies(res) {
  res.clearCookie("token");
}

function setCookieSession(res, token, newUser) {
  res.cookie("token", token);
  if(newUser) res.cookie("newUser", "true");
}

function getIDandAdmin(email) {
  return new Promise( (resolve, reject) => {
    const results = {};
    dbHandler.getIDByEmail(email).then( (ID) => {
      results.ID = ID;
      return ID;
    }).catch((error) => reject("ERROR GETTING THE EMAIL BY ID. "+error))
      .then( (ID) => {
        dbHandler.isAdmin(ID).then( (isAdmin) => {
          results.isAdmin = isAdmin;
          resolve(results);
        }).catch((error) => reject("CANNOT CHECK FOR ADMIN: "+error))
      })
  });
}

function getToken(ID, isAdmin, user) {
  const payload = {isAdmin, ID, email: user.email, lastName: user.lastName, firstName: user.firstName};
  const signOptions = {
    issuer: 'Heinrich Heine Universität',
    expiresIn: "12h",
    algorithm: "RS256"
  };
  return jwt.sign(payload, privateKEY, signOptions);
}

export default router;

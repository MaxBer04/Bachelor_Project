import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import DBHandler from '../databaseHandler.js';
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({extended:false});


const dbHandler = new DBHandler();

const privateKEY  = fs.readFileSync('./database/private.key', 'utf8');
const publicKEY  = fs.readFileSync('./database/public.key', 'utf8');
const i = 'Mysoft corp';
const a = 'http://mysoftcorp.in';
const payload = {};
let s;

const signOptions = {
  issuer:  i,
  subject:  s,
  audience:  a,
  expiresIn:  "12h",
  algorithm:  "RS256"
};
const signOptionsVerify = {
  issuer:  i,
  subject:  s,
  audience:  a,
  expiresIn:  "12h",
  algorithm:  ["RS256"]
}

router.get('/', (req, res, next)  =>{
  res.render('login');
});

router.get('/loginAttempt', (req, res, next)  =>{
  const user = {
    username: req.header('username'),
    password: req.header('password')
  }
  s = user.username;
  // SIGNING OPTIONS
  const token = jwt.sign(payload, privateKEY, signOptions);
  res.setHeader("status", "failedOnPassword");
  res.json({ status: 'failed' });
});

//const verifyToken = jwt.verify(token, publicKey, verifyOptions);

router.post('/signUpAttempt', urlencodedParser, (req, res, next) => {
  res.redirect('../');
});

export default router;

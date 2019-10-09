import express from 'express';
import {verifyToken} from './login.js';

var router = express.Router();
router.use(verifyToken);

router.get('/', (req, res, next)  => {
  res.render('main', (err, html) => {
    res.send(html);
  });
});

export default router;

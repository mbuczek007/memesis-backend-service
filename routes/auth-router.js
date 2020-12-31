const express = require('express');
const AuthCtrl = require('../controllers/auth-ctrl');
const { check } = require('express-validator');

const router = express.Router();

router.post(
  '/signup',
  check('name').isLength({ min: 2 }).withMessage('WRONG-NAME'),
  check('email').isEmail().withMessage('WRONG-EMAIL'),
  check('password').isLength({ min: 6 }).withMessage('SHORT-PASSWORD'),
  AuthCtrl.signup
);

router.post('/login', AuthCtrl.login);
router.post('/facebooklogin', AuthCtrl.facebooklogin);

module.exports = router;

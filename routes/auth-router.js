const express = require('express');
const AuthCtrl = require('../controllers/auth-ctrl');
const { check } = require('express-validator');

const router = express.Router();

router.post(
  '/signup',
  check('name')
    .isLength({ min: 2, max: 64, require })
    .withMessage('NOT-VALID-NAME'),
  check('email')
    .matches(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )
    .withMessage('NOT-VALID-EMAIL'),
  check('password')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/)
    .withMessage('NOT-VALID-PASSWORD'),
  AuthCtrl.signup
);
router.post('/signup/check', AuthCtrl.checkNameOrEmail);
router.post('/login', AuthCtrl.login);
router.post('/facebooklogin', AuthCtrl.facebooklogin);

module.exports = router;

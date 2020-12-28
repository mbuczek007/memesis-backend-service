const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

signup = async (req, res) => {
  const { name, email, password } = req.body;

  await User.findOne({ $or: [{ email }, { name }] })
    .then((user) => {
      if (user) {
        let errors = [];

        if (user.name === name) {
          errors.push('NAME-EXISTS');
        }

        if (user.email === email.toLowerCase()) {
          errors.push('EMAIL-ADDRESS-EXISTS');
        }

        return res.status(400).json({ success: false, errors: errors });
      } else {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
          return res
            .status(400)
            .json({ success: false, errors: validationErrors.array() });
        }

        bcrypt
          .hash(password, 10)
          .then((hash) => {
            let newUser = new User({ name, email, password: hash });

            newUser
              .save()
              .then(() => {
                return res.status(201).json({
                  success: true,
                  message: 'USER-CREATED',
                });
              })
              .catch((error) => {
                return res.status(400).json({
                  error,
                  success: false,
                  message: 'USER-NOT-CREATED',
                });
              });
          })
          .catch((err) => {
            return res.status(500).json({
              success: false,
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        error: err,
      });
    });
};

login = (req, res) => {
  User.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'LOGIN-FAILED',
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              success: false,
              error: 'LOGIN-FAILED',
            });
          }

          const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
          const token = jwt.sign(
            { userId: user.user_id },
            process.env.TOKEN_SECRET,
            { expiresIn: expirationTime }
          );

          return res.status(200).json({
            token: token,
            expirationTime: expirationTime,
            userData: {
              id: user.user_id,
              name: user.name,
              email: user.email,
            },
          });
        })
        .catch((error) => {
          return res.status(500).json({
            success: false,
            error: error,
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        success: false,
        error: error,
      });
    });
};

module.exports = {
  signup,
  login,
};

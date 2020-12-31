const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('../models/user-model');

const logInResponse = (user, res) => {
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const token = jwt.sign({ userId: user.user_id }, process.env.TOKEN_SECRET, {
    expiresIn: expirationTime,
  });

  return res.status(200).json({
    token: token,
    expirationTime: expirationTime,
    userData: {
      id: user.user_id,
      name: user.name,
      email: user.email,
    },
  });
};

const error500Response = (err, res) => {
  return res.status(500).json({
    success: false,
    error: err,
  });
};

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
      error500Response(err, res);
    });
};

login = (req, res) => {
  User.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          errors: 'LOGIN-FAILED',
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              success: false,
              errors: 'LOGIN-FAILED',
            });
          }

          logInResponse(user, res);
        })
        .catch((err) => {
          error500Response(err, res);
        });
    })
    .catch((err) => {
      error500Response(err, res);
    });
};

facebooklogin = (req, res) => {
  const { userId, accessToken } = req.body;
  let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userId}/?fields=id,name,email&access_token=${accessToken}`;

  fetch(urlGraphFacebook, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => {
      const { id, email, name } = response;

      User.findOne({ email })
        .then((user) => {
          if (user) {
            logInResponse(user, res);
          } else {
            const password = id + email + process.env.TOKEN_SECRET;
            bcrypt
              .hash(password, 10)
              .then((hash) => {
                let newUser = new User({ name, email, password: hash });

                newUser.save((err, data) => {
                  if (err) {
                    return res.status(400).json({
                      error: err,
                      success: false,
                      message: 'USER-NOT-CREATED',
                    });
                  }

                  logInResponse(data, res);
                });
              })
              .catch((err) => {
                error500Response(err, res);
              });
          }
        })
        .catch((err) => {
          error500Response(err, res);
        });
    });
};

module.exports = {
  signup,
  login,
  facebooklogin,
};

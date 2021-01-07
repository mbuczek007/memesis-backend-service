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

const error500Response = (error, res) => {
  return res.status(500).json({
    error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
  });
};

const parseNameOrEmail = (nameOrEmail) => {
  let string = nameOrEmail.replace(/\s/g, '');
  return string.trim().toLowerCase();
};

signup = async (req, res) => {
  const { name, email, password } = req.body;
  const parsedEmail = parseNameOrEmail(email);

  await User.findOne({
    $or: [{ email: parsedEmail }, { name: name.trim() }],
  })
    .then((user) => {
      if (user) {
        let error = '';

        if (user.name === name.trim()) {
          error = 'Podana nazwa uzytkownika jest juz uzywana.';
        }

        if (user.email === parsedEmail) {
          error = 'Adres e-mail jest juz w uzyciu.';
        }

        return res.status(400).json({ error });
      } else {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
          return res
            .status(400)
            .json({ error: 'Błąd podczas walidacji danych.' });
        }

        bcrypt
          .hash(password, 10)
          .then((hash) => {
            let newUser = new User({
              name: name.trim(),
              email: parsedEmail,
              password: hash,
            });

            newUser.save((error, data) => {
              if (error) {
                return res.status(400).json({
                  error:
                    'Wystąpił problem podczas tworzenia nowego uzytkownika. Prosimy spróbować później.',
                });
              }

              logInResponse(data, res);
            });
          })
          .catch((error) => {
            return res.status(500).json({
              error,
            });
          });
      }
    })
    .catch((error) => {
      error500Response(error, res);
    });
};

checkNameOrEmail = async (req, res) => {
  const { mode, nameOrEmail } = req.body;
  const parsedNameOrEmail = parseNameOrEmail(nameOrEmail);

  const args =
    mode === 'email'
      ? { email: parsedNameOrEmail }
      : { name: nameOrEmail.trim() };

  await User.findOne(args)
    .then((user) => {
      if (user) {
        let error = '';

        if (mode === 'name' && user.name === nameOrEmail.trim()) {
          error = 'Podana nazwa uzytkownika jest juz uzywana.';
        }

        if (mode === 'email' && user.email === parsedNameOrEmail) {
          error = 'Adres e-mail jest juz w uzyciu';
        }

        return res.status(400).json({ error });
      } else {
        return res.status(200).json({ success: true });
      }
    })
    .catch((error) => {
      error500Response(error, res);
    });
};

login = (req, res) => {
  User.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: 'Nieprawidłowy login lub hasło.',
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              error: 'Nieprawidłowy login lub hasło.',
            });
          }

          logInResponse(user, res);
        })
        .catch((error) => {
          error500Response(error, res);
        });
    })
    .catch((error) => {
      error500Response(error, res);
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
      if (response.error) {
        return res.status(400).json({
          error: 'Wystąpił problem z połączeniem. Prosimy spróbować później.',
        });
      }

      const { id, email, name } = response;
      User.findOne({ fb_id: id })
        .then((fbUser) => {
          if (fbUser) {
            logInResponse(fbUser, res);
          } else {
            const parsedEmail = parseNameOrEmail(email);
            User.findOne({
              $or: [{ email: parsedEmail }, { name: name.trim() }],
            })
              .then((user) => {
                if (user) {
                  let error = '';

                  if (user.name === name.trim()) {
                    error =
                      'Pobrana nazwa uzytkownika (' +
                      name.trim() +
                      ') jest juz uzywana.';
                  }

                  if (user.email === parsedEmail) {
                    error =
                      'Pobrany adres e-mail (' +
                      parsedEmail +
                      ') jest juz w uzyciu.';
                  }

                  return res.status(400).json({ error });
                } else {
                  const password = id + email + process.env.TOKEN_SECRET;
                  bcrypt
                    .hash(password, 10)
                    .then((hash) => {
                      let newUser = new User({
                        fb_id: id,
                        name: name.trim(),
                        email: parsedEmail,
                        password: hash,
                      });

                      newUser.save((error, data) => {
                        if (error) {
                          return res.status(400).json({
                            error:
                              'Wystąpił problem podczas tworzenia nowego uzytkownika. Prosimy spróbować później.',
                          });
                        }

                        logInResponse(data, res);
                      });
                    })
                    .catch((error) => {
                      error500Response(error, res);
                    });
                }
              })
              .catch((error) => {
                error500Response(error, res);
              });
          }
        })
        .catch((error) => {
          error500Response(error, res);
        });
    });
};

module.exports = {
  signup,
  checkNameOrEmail,
  login,
  facebooklogin,
};

const jwt = require('jsonwebtoken');

authCheck = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;

    if (!req.body.userId) {
      return res.status(401).json({
        error: 'INVALID-USER-ID',
      });
    }

    if (parseInt(req.body.userId) !== userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    } else {
      next();
    }
  } catch {
    return res.status(401).json({
      error: 'INVALID-REQUEST',
    });
  }
};

module.exports = {
  authCheck,
};

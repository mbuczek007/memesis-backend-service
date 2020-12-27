const jwt = require('jsonwebtoken');

authCheck = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;

    if (req.body.userId && req.body.userId !== userId) {
      return res.status(401).json({
        success: false,
        error: 'INVALID-USER-ID',
      });
    } else {
      next();
    }
  } catch {
    return res.status(401).json({
      success: false,
      error: 'INVALID-REQUEST',
    });
  }
};

module.exports = {
  authCheck,
};

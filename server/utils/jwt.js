const jwt = require('jsonwebtoken');

exports.signToken = (payload, opts = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h', ...opts });

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

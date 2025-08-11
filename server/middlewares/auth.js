const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, email, rol_id, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
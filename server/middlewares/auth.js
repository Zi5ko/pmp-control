// server/middlewares/auth.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  console.log("🔐 Token recibido:", token); // 👈 Agrega esto

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    console.error("❌ Token inválido:", e.message); // 👈 También esto
    return res.status(401).json({ error: 'Token inválido' });
  }
}
module.exports = { verifyToken };
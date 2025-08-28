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

// Middleware para proteger acceso a archivos subidos
function authUploads(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Acceso no autorizado: falta token');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Token no proporcionado');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // si lo necesitas en la lógica
    next();
  } catch (err) {
    return res.status(401).send('Token inválido');
  }
}

module.exports = { verifyToken, authUploads };
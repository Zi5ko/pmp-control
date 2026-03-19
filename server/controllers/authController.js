// server/controllers/authController.js

const passport = require('passport');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const frontendURL = process.env.FRONTEND_URL || 'https://pmp-control.pages.dev';
const googleStrategyEnabled = () => !!passport._strategy('google');

exports.startGoogleAuth = (req, res, next) => {
  if (!googleStrategyEnabled()) {
    return res.status(503).json({
      error: 'Google OAuth no está configurado en el servidor',
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL o BACKEND_URL']
    });
  }

  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  if (!googleStrategyEnabled()) {
    return res.redirect(`${frontendURL}/login?error=google_config`);
  }

  passport.authenticate('google', { session: false }, (err, user) => {
    console.log("🔁 Google Callback ejecutado");
    if (err) {
      console.error("❌ Error en callback:", err); // LOG CRÍTICO
      return next(err);
    }

    if (!user) {
      return res.redirect(`${frontendURL}/login?error=google`);
    }

    const rolId = Number(user.rol_id);

    const token = jwt.sign(
      { sub: user.id, email: user.email, rol_id: rolId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log("✅ Token generado:", token);

    res.redirect(`${frontendURL}/auth/google/success?token=${token}`);
  })(req, res, next);
};

// Manejador para el inicio de sesión local
exports.localLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const result = await db.query(
      `SELECT u.*, r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const rolId = Number(user.rol_id);

    const token = jwt.sign(
      { sub: user.id, email: user.email, rol_id: rolId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        rol_id: rolId,
        rol_nombre: user.rol_nombre,
        nombre: user.nombre
      }
    });

  } catch (error) {
    console.error('Error en login local:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint protegido: devuelve info del usuario desde req.user
exports.me = async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await db.query(`
      SELECT u.id, u.email, u.nombre, u.rol_id, r.nombre AS rol_nombre
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1
    `, [userId]);

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const rolId = Number(user.rol_id);

    return res.status(200).json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol_id: rolId,
      rol_nombre: user.rol_nombre
    });
  } catch (e) {
    console.error("❌ Error en /me:", e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

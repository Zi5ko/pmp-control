// server/controllers/authController.js

const passport = require('passport');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const frontendURL = process.env.FRONTEND_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://pmp-control.pages.dev'
    : 'http://localhost:5173'
);
const googleStrategyEnabled = () => !!passport._strategy('google');
const jwtSecretConfigured = () => typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.trim().length > 0;

function redirectToLoginWithError(res, errorCode) {
  return res.redirect(`${frontendURL}/login?error=${errorCode}`);
}

function buildAuthToken(user) {
  if (!jwtSecretConfigured()) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { sub: user.id, email: user.email, rol_id: Number(user.rol_id) },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

exports.startGoogleAuth = (req, res, next) => {
  if (!googleStrategyEnabled()) {
    return res.status(503).json({
      error: 'Google OAuth no está configurado en el servidor',
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL o BACKEND_URL o RAILWAY_PUBLIC_DOMAIN']
    });
  }

  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  if (!googleStrategyEnabled()) {
    return redirectToLoginWithError(res, 'google_config');
  }

  if (req.query.error) {
    console.error('❌ Google devolvió un error en el callback:', req.query.error, req.query.error_description || '');
    return redirectToLoginWithError(res, 'google');
  }

  passport.authenticate('google', { session: false }, (err, user) => {
    console.log('🔁 Google Callback ejecutado');

    if (err) {
      console.error('❌ Error en callback de Google:', err);
      return redirectToLoginWithError(res, 'google_server');
    }

    if (!user) {
      return redirectToLoginWithError(res, 'google');
    }

    try {
      const token = buildAuthToken(user);
      console.log('✅ Token generado para Google');
      return res.redirect(`${frontendURL}/auth/google/success?token=${token}`);
    } catch (tokenError) {
      console.error('❌ No se pudo generar el token para Google:', tokenError);
      return redirectToLoginWithError(res, 'google_config');
    }
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

    const token = buildAuthToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        rol_id: Number(user.rol_id),
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

    return res.status(200).json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol_id: Number(user.rol_id),
      rol_nombre: user.rol_nombre
    });
  } catch (e) {
    console.error('❌ Error en /me:', e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

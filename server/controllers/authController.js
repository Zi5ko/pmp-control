const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../db');


exports.startGoogleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).send('No autorizado');

    const token = jwt.sign(
      { sub: user.id, email: user.email, rol_id: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    //Establecer cookie segura con el token
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,           // ⚠️ En producción con HTTPS, cambia a true
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8 // 8 horas
    });

    //Redirige al frontend sin token en URL
    const target = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(target);
  })(req, res, next);
};


// Simple local login placeholder used for tests
exports.localLogin = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, rol_id: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // true solo en producción con HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    });

    return res.json({ ok: true, msg: 'Login exitoso' });

  } catch (err) {
    console.error('Error en login local:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Endpoint to fetch user info from a JWT token
exports.me = (req, res) => {
  const token = req.cookies.jwt;

  console.log("Token recibido:", token);

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    return res.json({
      id: payload.sub,
      email: payload.email,
      rol: payload.rol_id
    });
  } catch (_e) {
    console.error("❌ Error al verificar token:", _e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

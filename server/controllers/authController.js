const jwt = require('jsonwebtoken');
const passport = require('passport');

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

    // Si tienes FRONTEND_URL, redirige con el token
    if (process.env.FRONTEND_URL) {
      const target = `${process.env.FRONTEND_URL}/oauth-callback#token=${token}`;
      return res.redirect(target);
    }

    // Si no hay frontend aún, devuelve JSON para probar
    return res.json({ ok: true, token });
  })(req, res, next);
};

// Simple local login placeholder used for tests
exports.localLogin = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }
  // In a real implementation you'd verify credentials here
  return res.status(401).json({ error: 'Credenciales inválidas' });
};

// Endpoint to fetch user info from a JWT token
exports.me = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    return res.json({ id: payload.sub, email: payload.email, rol_id: payload.rol_id });
  } catch (_e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

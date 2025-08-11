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

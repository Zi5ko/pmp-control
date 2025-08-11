const { Strategy } = require('passport-google-oauth20');
const pool = require('../db');

module.exports = function initPassport(passport) {
  passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const nombre = profile.displayName;

      // Ajusta a tu esquema real de "usuarios"
      const result = await pool.query(
        `INSERT INTO usuarios (email, nombre, rol_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id, email, rol_id`,
        [email, nombre, 1]
      );

      return done(null, result.rows[0]);
    } catch (e) {
      return done(e);
    }
  }));
};
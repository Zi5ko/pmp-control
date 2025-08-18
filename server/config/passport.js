const { Strategy } = require('passport-google-oauth20');
const db = require('../db');

module.exports = function initPassport(passport) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    BACKEND_URL
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BACKEND_URL) {
    console.warn('Google OAuth environment variables missing, skipping strategy');
    return;
  }

  passport.use(new Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/google/callback` 
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const nombre = profile.displayName;

      // Buscar usuario por email
      const existing = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      let user = existing.rows[0];

      // Si no existe, lo crea
      if (!user) {
        const result = await db.query(
          `INSERT INTO usuarios (email, nombre, rol_id)
           VALUES ($1, $2, $3)
           RETURNING id, email, rol_id`,
          [email, nombre, 1]  // Rol por defecto: administrador (puedes ajustarlo)
        );
        user = result.rows[0];
      }

      return done(null, user);
    } catch (err) {
      console.error("Error en GoogleStrategy:", err);
      return done(err, null);
    }
  }));
};
//server/config/passport.js
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
      console.log("🎯 Google Profile:", profile);
      const email = profile.emails?.[0]?.value;
      const nombre = profile.displayName;
  
      if (!email) {
        console.error("❌ No se obtuvo email desde el perfil de Google");
        return done(null, false);
      }
  
      // Buscar usuario por email
      const existing = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      let user = existing.rows[0];

      // Solo se permite crear un usuario por Google si no hay usuarios registrados
      if (!user) {
        const count = await db.query('SELECT COUNT(*) FROM usuarios');
        const total = parseInt(count.rows[0].count, 10);

        if (total === 0) {
          // Primer usuario: se permite crear como administrador
          const result = await db.query(
            `INSERT INTO usuarios (email, nombre, rol_id)
            VALUES ($1, $2, $3)
            RETURNING id, email, rol_id`,
            [email, nombre, 1]
          );
          user = result.rows[0];
        } else {
          // Ya hay usuarios: bloquear acceso
          return done(null, false);
        }
  }
  done(null, user);
} catch (error) {
  console.error("❌ Error al procesar el perfil de Google:", error);
  done(error, null);
}
}));
};
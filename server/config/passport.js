//server/config/passport.js
const { Strategy } = require('passport-google-oauth20');
const db = require('../db');

function normalizeBaseUrl(rawUrl) {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    // En Railway el dominio público no requiere :3000 en HTTPS.
    if (parsed.hostname.endsWith('.up.railway.app') && parsed.port === '3000') {
      parsed.port = '';
      parsed.protocol = 'https:';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch (_error) {
    return rawUrl.replace(/\/$/, '');
  }
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : null;
}

module.exports = function initPassport(passport) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    BACKEND_URL,
    GOOGLE_CALLBACK_URL,
    RAILWAY_PUBLIC_DOMAIN
  } = process.env;

  const normalizedGoogleCallbackUrl = normalizeBaseUrl(GOOGLE_CALLBACK_URL);
  const normalizedBackendUrl = normalizeBaseUrl(BACKEND_URL);

  const callbackURL = normalizedGoogleCallbackUrl
    ? normalizedGoogleCallbackUrl
    : (normalizedBackendUrl
      ? `${normalizedBackendUrl}/api/auth/google/callback`
      : (RAILWAY_PUBLIC_DOMAIN ? `https://${RAILWAY_PUBLIC_DOMAIN}/api/auth/google/callback` : null));

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !callbackURL) {
    const missing = [];
    if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!callbackURL) missing.push('GOOGLE_CALLBACK_URL o BACKEND_URL o RAILWAY_PUBLIC_DOMAIN');
    console.warn(`Google OAuth environment variables missing, skipping strategy. Missing: ${missing.join(', ')}`);
    return;
  }

  passport.use(new Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = normalizeEmail(profile.emails?.[0]?.value);
      const nombre = profile.displayName?.trim() || email;

      if (!email) {
        console.error('❌ No se obtuvo email desde el perfil de Google');
        return done(null, false);
      }

      const existing = await db.query(
        'SELECT id, email, nombre, rol_id FROM usuarios WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email]
      );
      let user = existing.rows[0];

      if (!user) {
        const count = await db.query('SELECT COUNT(*) FROM usuarios');
        const total = Number.parseInt(count.rows[0].count, 10);

        if (total === 0) {
          const result = await db.query(
            `INSERT INTO usuarios (email, nombre, rol_id)
             VALUES ($1, $2, $3)
             RETURNING id, email, nombre, rol_id`,
            [email, nombre, 1]
          );
          user = result.rows[0];
        } else {
          return done(null, false);
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('❌ Error al procesar el perfil de Google:', error);
      return done(error, null);
    }
  }));
};

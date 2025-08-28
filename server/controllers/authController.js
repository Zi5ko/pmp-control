const passport = require('passport');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
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

    const token = jwt.sign(
      { sub: user.id, email: user.email, rol_id: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre,
        nombre: user.nombre
      }
    });

  } catch (error) {
    console.error('Error en login local:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint to fetch user info from a JWT token
exports.me = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    const userId = payload.sub;

    // Consulta con JOIN para obtener el nombre del rol
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
      rol_id: user.rol_id,
      rol_nombre: user.rol_nombre
    });
  } catch (e) {
    console.error("❌ Error al verificar token:", e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

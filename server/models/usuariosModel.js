const pool = require('../db');

// Buscar usuario por email (para login)
async function getUsuarioByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

// Crear nuevo usuario (para pruebas o admin)
async function crearUsuario({ nombre, email, password_hash, rol_id }) {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nombre, email, password_hash, rol_id]
  );
  return result.rows[0];
}

module.exports = {
  getUsuarioByEmail,
  crearUsuario,
  getUsuarios
};

async function getUsuarios() {
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
  }
  

  
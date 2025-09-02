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

// Listar usuarios
async function getUsuarios() {
  const result = await pool.query('SELECT * FROM usuarios');
  return result.rows;
}

// Actualizar usuario
async function actualizarUsuario(id, { nombre, email, rol_id }) {
  const result = await pool.query(
    `UPDATE usuarios SET nombre = $1, email = $2, rol_id = $3
     WHERE id = $4 RETURNING *`,
    [nombre, email, rol_id, id]
  );
  return result.rows[0];
}

// Eliminar usuario
async function eliminarUsuario(id) {
  await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
}

module.exports = {
  getUsuarioByEmail,
  crearUsuario,
  getUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};


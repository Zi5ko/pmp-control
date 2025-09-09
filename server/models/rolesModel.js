const pool = require('../db');

async function getRoles() {
  // Devolver todos los roles sin excluir "calidad"
  const result = await pool.query("SELECT id, nombre FROM roles ORDER BY id");
  return result.rows;
}

module.exports = { getRoles };

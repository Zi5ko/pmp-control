const pool = require('../db');

async function getRoles() {
  const result = await pool.query("SELECT id, nombre FROM roles WHERE nombre <> 'calidad' ORDER BY id");
  return result.rows;
}

module.exports = { getRoles };

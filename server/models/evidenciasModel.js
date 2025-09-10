const db = require('../db');

async function agregarEvidencia({ orden_id, url, tipo, subido_por }) {
  const result = await db.query(`
    INSERT INTO evidencias (orden_id, url, tipo, subido_por, subido_en)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *
  `, [orden_id, url, tipo, subido_por]);

  return result.rows[0];
}

async function obtenerEvidenciasPorOrden(orden_id) {
  const result = await db.query(`
    SELECT * FROM evidencias
    WHERE orden_id = $1
    ORDER BY subido_en DESC
  `, [orden_id]);

  return result.rows;
}

async function obtenerEvidenciaPorId(id) {
  const result = await db.query(
    `SELECT * FROM evidencias WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function eliminarEvidencia(id) {
  const result = await db.query(
    `DELETE FROM evidencias WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  agregarEvidencia,
  obtenerEvidenciasPorOrden,
  obtenerEvidenciaPorId,
  eliminarEvidencia
};

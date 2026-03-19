//server/models/logsAuditoriaModel.js
const pool = require('../db');

async function resolveUsuarioId(usuario_id) {
  if (usuario_id === undefined || usuario_id === null || usuario_id === '') {
    return null;
  }

  const normalizedUsuarioId = Number.parseInt(usuario_id, 10);
  if (!Number.isInteger(normalizedUsuarioId) || normalizedUsuarioId <= 0) {
    return null;
  }

  const result = await pool.query(
    'SELECT id FROM usuarios WHERE id = $1 LIMIT 1',
    [normalizedUsuarioId]
  );

  if (result.rowCount === 0) {
    console.warn(`⚠️ No se registró usuario_id=${normalizedUsuarioId} en logs_auditoria porque no existe en usuarios.`);
    return null;
  }

  return normalizedUsuarioId;
}

/**
 * Registra una acción en la tabla logs_auditoria
 * @param {Object} data
 * @param {number} data.usuario_id - ID del usuario que realiza la acción
 * @param {string} data.accion - Descripción breve de la acción
 * @param {string} data.tabla - Nombre de la tabla afectada
 * @param {number} data.registro_id - ID del registro afectado
 */
async function crearLog({ usuario_id, accion, tabla, registro_id }) {
  const safeUsuarioId = await resolveUsuarioId(usuario_id);

  const result = await pool.query(
    `INSERT INTO logs_auditoria 
    (usuario_id, accion, tabla_afectada, registro_id, fecha)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *`,
    [safeUsuarioId, accion, tabla, registro_id]
  );
  return result.rows[0];
}

async function obtenerLogsAuditoria() {
  const result = await pool.query(`
    SELECT l.*, u.nombre AS usuario
    FROM logs_auditoria l
    LEFT JOIN usuarios u ON l.usuario_id = u.id
    ORDER BY l.fecha DESC
  `);
  return result.rows;
}

module.exports = {
  crearLog,
  obtenerLogsAuditoria
};

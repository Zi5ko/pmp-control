const pool = require('../db');

/**
 * Registra una acción en la tabla logs_auditoria
 * @param {Object} data
 * @param {number} data.usuario_id - ID del usuario que realiza la acción
 * @param {string} data.accion - Descripción breve de la acción
 * @param {string} data.tabla - Nombre de la tabla afectada
 * @param {number} data.registro_id - ID del registro afectado
 */
async function crearLog({ usuario_id, accion, tabla, registro_id }) {
  const result = await pool.query(
    `INSERT INTO logs_auditoria 
    (usuario_id, accion, tabla_afectada, registro_id, fecha)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *`,
    [usuario_id, accion, tabla, registro_id]
  );
  return result.rows[0];
}

module.exports = { crearLog };

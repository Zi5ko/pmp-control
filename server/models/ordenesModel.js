const pool = require('../db');

// Obtener todas las órdenes de trabajo
async function getOrdenes() {
  const result = await pool.query('SELECT * FROM ordenes_trabajo');
  return result.rows;
}

// Obtener orden por ID
async function getOrdenById(id) {
  const result = await pool.query(
    'SELECT * FROM ordenes_trabajo WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Crear nueva orden de trabajo
async function crearOrden(data) {
  const {
    equipo_id,
    plan_id,
    fecha_programada,
    fecha_ejecucion,
    responsable,
    estado,
    observaciones
  } = data;

  const result = await pool.query(
    `INSERT INTO ordenes_trabajo
     (equipo_id, plan_id, fecha_programada, fecha_ejecucion, responsable, estado, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [equipo_id, plan_id, fecha_programada, fecha_ejecucion, responsable, estado, observaciones]
  );
  return result.rows[0];
}

// Actualizar estado de una orden
async function actualizarEstadoOrden(id, nuevoEstado) {
  const result = await pool.query(
    `UPDATE ordenes_trabajo SET estado = $1 WHERE id = $2 RETURNING *`,
    [nuevoEstado, id]
  );
  return result.rows[0];
}

// Obtener detalle completo de una orden (con JOIN)
async function getOrdenDetallada(id) {
  const result = await pool.query(
    `
    SELECT 
      o.id,
      o.fecha_programada,
      o.fecha_ejecucion,
      o.estado,
      o.responsable,
      o.observaciones,
      e.nombre AS equipo_nombre,
      e.ubicacion,
      p.nombre AS plan_nombre,
      p.tipo AS tipo_mantenimiento,
      p.frecuencia
    FROM ordenes_trabajo o
    JOIN equipos e ON o.equipo_id = e.id
    JOIN planes_mantenimiento p ON o.plan_id = p.id
    WHERE o.id = $1
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  getOrdenes,
  getOrdenById,
  crearOrden,
  actualizarEstadoOrden,
  getOrdenDetallada
};
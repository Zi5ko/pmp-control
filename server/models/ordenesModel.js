const pool = require('../db');
const { crearLog } = require('./logsAuditoriaModel');
const path = require('path');

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
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING *`,
    [
      equipo_id,
      plan_id,
      fecha_programada,
      fecha_ejecucion,
      responsable,
      estado,
      JSON.stringify(observaciones || {})
    ]
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
    SELECT ot.*, e.nombre AS equipo_nombre, e.ubicacion, u.nombre AS tecnico_nombre
    FROM ordenes_trabajo ot
    JOIN equipos e ON ot.equipo_id = e.id
    LEFT JOIN usuarios u ON CAST(ot.responsable AS INTEGER) = u.id
    WHERE ot.id = $1
  `,
    [id]
  );

  return result.rows[0];
}

// Obtener órdenes ejecutadas no validadas
async function obtenerOrdenesEjecutadasNoValidadas() {
  const query = `
    SELECT ot.*,
           e.nombre AS equipo_nombre,
           e.ubicacion,
           e.serie AS equipo_serie,
           u.nombre AS tecnico_nombre,
           (
             SELECT COUNT(*)
             FROM evidencias ev
             WHERE ev.orden_id = ot.id
           ) AS total_evidencias
    FROM ordenes_trabajo ot
    JOIN equipos e ON ot.equipo_id = e.id
    LEFT JOIN usuarios u ON ot.responsable = CAST(u.id AS VARCHAR)
    WHERE ot.estado = 'realizada'
    ORDER BY ot.fecha_ejecucion DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
}

// Validar orden de trabajo
async function validarOrdenTrabajo(id, validada, comentario, supervisor_id) {
  const nuevoEstado = validada ? 'validada' : 'pendiente';

  const update = await pool.query(
    `
    UPDATE ordenes_trabajo
    SET estado = $1,
        observaciones = COALESCE(observaciones, '{}'::jsonb) || jsonb_build_object('comentarios_supervisor', $2)
    WHERE id = $3
    RETURNING *
  `,
    [nuevoEstado, comentario || '', id]
  );

  await crearLog({
    usuario_id: supervisor_id,
    accion: validada ? 'validar_orden' : 'rechazar_orden',
    tabla: 'ordenes_trabajo',
    registro_id: id
  });

  return update.rows[0];
}

// Obtener historial de órdenes de trabajo
async function obtenerHistorialOrdenes(usuario_id, rol_id) {
  let query = `
    SELECT ot.*, 
           e.nombre AS equipo_nombre, 
           e.ubicacion, 
           u.nombre AS tecnico_nombre,
           COALESCE(json_agg(json_build_object('url', ev.url, 'tipo', ev.tipo, 'subido_por', ev.subido_por)) 
                    FILTER (WHERE ev.id IS NOT NULL), '[]') AS evidencias
    FROM ordenes_trabajo ot
    JOIN equipos e ON ot.equipo_id = e.id
    LEFT JOIN usuarios u ON ot.responsable = CAST(u.id AS VARCHAR)
    LEFT JOIN evidencias ev ON ot.id = ev.orden_id
    WHERE ot.estado IN ('firmada', 'validada')
  `;

  const params = [];

  if (rol_id === 3) {
    query += ` AND ot.responsable = $1`;
    params.push(usuario_id.toString());
  }

  query += `
    GROUP BY ot.id, e.nombre, e.ubicacion, u.nombre
    ORDER BY ot.fecha_ejecucion DESC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

// Generar reporte PDF de una orden de trabajo
async function generarReporteOrden(id) {
  const orden = await getOrdenDetallada(id);
  if (!orden) throw new Error('Orden no encontrada');

  // Rutas de las firmas
  const firmaTecnicoPath = path.join(__dirname, '../uploads/firmas', `${orden.responsable}_firma.png`);
  const firmaServicioPath = path.join(__dirname, '../uploads/firmas_servicio', `${id}_firma.png`);
  
  const nombreArchivo = `reporte_${id}_${Date.now()}.pdf`;
  const ruta = await generarReportePDF(orden, firmaTecnicoPath, firmaServicioPath, nombreArchivo);

  // Registrar como evidencia
  await pool.query(`
    INSERT INTO evidencias (orden_id, url, tipo, subido_por)
    VALUES ($1, $2, $3, $4)
  `, [id, ruta, 'reporte_firmado', orden.responsable]);

  return ruta;
}

// Obtener la evidencia del reporte firmado más reciente para una orden
async function getEvidenciaReporte(id_orden) {
  const result = await pool.query(`
    SELECT * FROM evidencias
    WHERE orden_id = $1 AND tipo = 'reporte_firmado'
    ORDER BY subido_en DESC
    LIMIT 1
  `, [id_orden]);

  return result.rows[0];
}

module.exports = {
  getOrdenes,
  getOrdenById,
  crearOrden,
  actualizarEstadoOrden,
  getOrdenDetallada,
  obtenerOrdenesEjecutadasNoValidadas,
  validarOrdenTrabajo,
  obtenerHistorialOrdenes,
  generarReporteOrden,
  getEvidenciaReporte
};
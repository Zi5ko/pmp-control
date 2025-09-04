// server/controllers/alertasController.js
const db = require('../db');

// IDs de tipo de alerta (definidos según tus registros en tipos_alerta)
const TIPO_ALERTA_FECHA_VENCIDA = 1;

exports.generarAlertas = async (req, res) => {
  try {
    const hoy = new Date();
    const domingoAnterior = new Date();
    domingoAnterior.setDate(hoy.getDate() - hoy.getDay());

    const { rows: ordenesVencidas } = await db.query(`
      SELECT o.id AS orden_id, o.equipo_id, e.nombre AS equipo_nombre, o.fecha_programada
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      WHERE o.estado = 'pendiente' AND o.fecha_programada <= $1
    `, [domingoAnterior]);

    const nuevasAlertas = [];

    for (const orden of ordenesVencidas) {
      const yaExiste = await db.query(`
        SELECT 1 FROM alertas
        WHERE orden_id = $1 AND tipo_id = $2 AND leida = false
      `, [orden.orden_id, TIPO_ALERTA_FECHA_VENCIDA]);

      if (yaExiste.rowCount === 0) {
        const mensaje = `Orden pendiente desde ${orden.fecha_programada} para el equipo "${orden.equipo_nombre}"`;

        const insert = await db.query(`
          INSERT INTO alertas (orden_id, tipo_id, mensaje)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [orden.orden_id, TIPO_ALERTA_FECHA_VENCIDA, mensaje]);

        nuevasAlertas.push(insert.rows[0]);
      }
    }

    res.json({ generadas: nuevasAlertas.length, nuevasAlertas });

  } catch (err) {
    console.error("❌ Error al generar alertas:", err);
    res.status(500).json({ error: "Error al generar alertas" });
  }
};

exports.obtenerAlertas = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        a.id,
        a.mensaje,
        a.leida,
        a.generada_en,
        o.id AS orden_id,
        e.id AS equipo_id,
        e.nombre AS equipo_nombre,
        e.ubicacion,
        e.criticidad,
        ta.nombre AS tipo_alerta
      FROM alertas a
      LEFT JOIN ordenes_trabajo o ON a.orden_id = o.id
      LEFT JOIN equipos e ON o.equipo_id = e.id
      LEFT JOIN tipos_alerta ta ON a.tipo_id = ta.id
      ORDER BY a.generada_en DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener alertas:", error);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
};


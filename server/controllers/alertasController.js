// server/controllers/alertasController.js
const db = require('../db');

// IDs de tipo de alerta (definidos según tus registros en tipos_alerta)
const TIPO_ALERTA_FECHA_VENCIDA = 1;

exports.generarAlertas = async (req, res) => {
  try {
    // Domingo anterior (00:00) como corte
    const hoy = new Date();
    const domingoAnterior = new Date(hoy);
    domingoAnterior.setHours(0, 0, 0, 0);
    domingoAnterior.setDate(hoy.getDate() - hoy.getDay());

    // 1) Candidatas: OTs vencidas (pendiente/realizada) con fecha <= domingoAnterior
    const { rows: candidatas } = await db.query(`
      SELECT 
        o.id                  AS ot_id,
        o.equipo_id,
        e.nombre              AS equipo_nombre,
        o.fecha_programada::date AS fecha_prog
      FROM ordenes_trabajo o
      JOIN equipos e ON e.id = o.equipo_id
      WHERE o.estado IN ('pendiente','realizada')
        AND o.fecha_programada::date <= $1::date
    `, [domingoAnterior]);

    const nuevasAlertas = [];
    let insertadas = 0;

    // 2) Insertar evitando duplicados (misma alerta, mismo día)
    for (const c of candidatas) {
      const mensaje = `Orden pendiente desde ${c.fecha_prog} para el equipo "${c.equipo_nombre}"`;

      // Evita duplicar alertas iguales el mismo día
      const noExisteHoy = await db.query(`
        SELECT 1 
        FROM alertas 
        WHERE equipo_id = $1 
          AND tipo_id   = $2
          AND mensaje   = $3
          AND DATE(generada_en) = CURRENT_DATE
      `, [c.equipo_id, TIPO_ALERTA_FECHA_VENCIDA, mensaje]);

      if (noExisteHoy.rowCount === 0) {
        const ins = await db.query(`
          INSERT INTO alertas (equipo_id, tipo_id, mensaje, leida, generada_en)
          VALUES ($1, $2, $3, false, NOW())
          RETURNING equipo_id, tipo_id, mensaje, leida, generada_en
        `, [c.equipo_id, TIPO_ALERTA_FECHA_VENCIDA, mensaje]);

        nuevasAlertas.push(ins.rows[0]);
        insertadas++;
      }
    }

    // 3) Limpieza: quita alertas no leídas generadas HOY que ya no apliquen
    // (sin usar orden_id; se compara contra el conjunto actual de candidatas)
    await db.query(`
      DELETE FROM alertas a
      WHERE a.leida = false
        AND DATE(a.generada_en) = CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1
          FROM (
            SELECT 
              o.equipo_id,
              1 AS tipo_id,
              concat('Orden pendiente desde ', o.fecha_programada::date, ' para el equipo "', e.nombre, '"') AS mensaje
            FROM ordenes_trabajo o
            JOIN equipos e ON e.id = o.equipo_id
            WHERE o.estado IN ('pendiente','realizada')
              AND o.fecha_programada::date <= $1::date
          ) cand
          WHERE cand.equipo_id = a.equipo_id
            AND cand.tipo_id   = a.tipo_id
            AND cand.mensaje   = a.mensaje
        )
    `, [domingoAnterior]);

    return res.status(200).json({
      ok: true,
      total_detectadas: candidatas.length,
      insertadas,
      nuevasAlertas
    });

  } catch (err) {
    console.error("❌ Error al generar alertas:", err);
    return res.status(500).json({ ok: false, error: "Error al generar alertas" });
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
        a.orden_id,
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

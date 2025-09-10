// server/controllers/alertasController.js
const db = require('../db');

// IDs de tipo de alerta (de la tabla tipos_alerta)
const TIPO_ALERTA_FECHA_VENCIDA = 1; // 'vencimiento mantenimiento'

exports.generarAlertas = async (req, res) => {
  try {
    // Domingo anterior (00:00) como corte
    const hoy = new Date();
    const domingoAnterior = new Date(hoy);
    domingoAnterior.setHours(0, 0, 0, 0);
    domingoAnterior.setDate(hoy.getDate() - hoy.getDay());

    // 0) Cerrar alertas cuya orden ya fue firmada/validada (coincidencia por equipo+mensaje)
    await db.query(
      `UPDATE alertas a
       SET leida = TRUE
       FROM ordenes_trabajo o
       JOIN equipos e ON e.id = o.equipo_id
       WHERE a.leida = FALSE
         AND a.tipo_id = $1
         AND a.equipo_id = e.id
         AND a.mensaje = CONCAT('OT ', o.id, ' pendiente desde ', o.fecha_programada::date,
                                ' para el equipo "', e.nombre, '"')
         AND o.estado IN ('firmada', 'validada')`,
      [TIPO_ALERTA_FECHA_VENCIDA]
    );

    // 1) Insertar/asegurar alertas de OTs vencidas/no ejecutadas desde el domingo anterior
    //    Considera pendientes, asignadas o realizadas (sin firma)
    const insertSQL = `
      INSERT INTO alertas (equipo_id, tipo_id, mensaje, leida, generada_en)
      SELECT 
        e.id AS equipo_id,
        $2   AS tipo_id,
        CONCAT('OT ', o.id, ' pendiente desde ', o.fecha_programada::date,
               ' para el equipo "', e.nombre, '"') AS mensaje,
        FALSE,
        NOW()
      FROM ordenes_trabajo o
      JOIN equipos e ON e.id = o.equipo_id
      WHERE o.estado NOT IN ('firmada','validada')
        AND o.fecha_programada::date <= $1::date
        AND NOT EXISTS (
          SELECT 1 FROM alertas a
          WHERE a.leida = FALSE
            AND a.tipo_id = $2
            AND a.equipo_id = e.id
            AND a.mensaje = CONCAT('OT ', o.id, ' pendiente desde ', o.fecha_programada::date,
                                   ' para el equipo "', e.nombre, '"')
        )
      RETURNING id`;

    const resultInsert = await db.query(insertSQL, [domingoAnterior, TIPO_ALERTA_FECHA_VENCIDA]);

    // 2) Cerrar alertas vigentes cuya condición ya no aplica (reprogramadas a futuro, etc.)
    await db.query(
      `UPDATE alertas a
       SET leida = TRUE
       WHERE a.leida = FALSE
         AND a.tipo_id = $2
         AND NOT EXISTS (
           SELECT 1
           FROM ordenes_trabajo o
           JOIN equipos e ON e.id = o.equipo_id
           WHERE a.equipo_id = e.id
             AND a.mensaje = CONCAT('OT ', o.id, ' pendiente desde ', o.fecha_programada::date,
                                    ' para el equipo "', e.nombre, '"')
             AND o.estado NOT IN ('firmada','validada')
             AND o.fecha_programada::date <= $1::date
         )`,
      [domingoAnterior, TIPO_ALERTA_FECHA_VENCIDA]
    );

    return res.status(200).json({
      ok: true,
      insertadas: resultInsert.rowCount || 0
    });
  } catch (err) {
    console.error("❌ Error al generar alertas:", err);
    return res.status(500).json({ ok: false, error: "Error al generar alertas" });
  }
};

exports.obtenerAlertas = async (req, res) => {
  try {
    // Calcular domingo anterior para filtro de lectura
    const hoy = new Date();
    const domingoAnterior = new Date(hoy);
    domingoAnterior.setHours(0, 0, 0, 0);
    domingoAnterior.setDate(hoy.getDate() - hoy.getDay());

    const { rows } = await db.query(`
      WITH alertas_con_ot AS (
        SELECT
          a.id,
          a.mensaje,
          a.leida,
          a.generada_en,
          a.equipo_id,
          -- Extraer id de OT desde el mensaje "OT {id} ..."
          NULLIF((regexp_matches(a.mensaje, 'OT\\s+([0-9]+)'))[1], '')::int AS orden_id_extraido
        FROM alertas a
        WHERE a.leida = FALSE
      )
      SELECT
        ac.id,
        ac.mensaje,
        ac.leida,
        ac.generada_en,
        ac.equipo_id,
        o.id AS orden_id,
        o.estado AS orden_estado,
        o.fecha_programada,
        e.nombre AS equipo_nombre,
        e.ubicacion,
        e.criticidad,
        ta.nombre AS tipo_alerta
      FROM alertas_con_ot ac
      JOIN equipos e ON ac.equipo_id = e.id
      LEFT JOIN ordenes_trabajo o ON o.id = ac.orden_id_extraido
      LEFT JOIN tipos_alerta ta ON ta.id = 1
      WHERE (
        o.id IS NULL -- si no encontramos la OT, igual mostrar
        OR (
          o.estado NOT IN ('firmada','validada')
          AND o.fecha_programada::date <= $1::date
        )
      )
      ORDER BY o.fecha_programada ASC NULLS LAST, ac.generada_en DESC
    `, [domingoAnterior]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener alertas:", error);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
};

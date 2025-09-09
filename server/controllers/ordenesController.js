// server/controllers/ordenesController.js
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { endOfWeek } = require("date-fns");
const generarReportePDF = require('../utils/generarReportes');
const { randomUUID } = require("crypto");

const {
  getOrdenes,
  getOrdenById,
  crearOrden,
  actualizarEstadoOrden,
  getOrdenDetallada,
  obtenerOrdenesEjecutadasNoValidadas,
  validarOrdenTrabajo,
  obtenerHistorialOrdenes
} = require('../models/ordenesModel');

const { crearLog } = require('../models/logsAuditoriaModel');

const FRECUENCIA_SEMANAS = {
  mensual: 4,
  trimestral: 12,
  semestral: 24,
  anual: 52
};

// 1. Listar todas las órdenes
async function listarOrdenes(req, res) {
  try {
    const ordenes = await getOrdenes();
    res.json(ordenes);
  } catch (err) {
    console.error('Error al listar órdenes:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
}

// 2. Obtener orden por ID
async function obtenerOrden(req, res) {
  try {
    const orden = await getOrdenById(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(orden);
  } catch (err) {
    console.error('Error al obtener orden:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
}

// 3. Crear nueva orden
async function crearNuevaOrden(req, res) {
  try {
    const { equipo_id, fecha_programada, estado } = req.body;

    const result = await db.query(
      'SELECT plan_id FROM equipos WHERE id = $1',
      [equipo_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const plan_id = result.rows[0].plan_id;

    // Verifica que no exista ya una orden pendiente para este equipo
    const { rowCount: ordenesActivas } = await db.query(
      `
      SELECT 1 FROM ordenes_trabajo
      WHERE equipo_id = $1 AND estado = 'pendiente'
      LIMIT 1
    `,
      [equipo_id]
    );

    if (ordenesActivas > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe una orden activa para este equipo." });
    }

    const insert = await db.query(
      `INSERT INTO ordenes_trabajo (equipo_id, plan_id, fecha_programada, estado)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [equipo_id, plan_id, fecha_programada, estado]
    );

    await crearLog({
      usuario_id: 2, // temporal
      accion: 'crear_orden',
      tabla: 'ordenes_trabajo',
      registro_id: insert.rows[0].id
    });

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('❌ Error al crear orden:', err);
    res.status(500).json({ error: err.message });
  }
}

// 4. Cambiar estado
async function cambiarEstado(req, res) {
  try {
    const nuevaEstado = req.body.estado;
    const orden = await actualizarEstadoOrden(req.params.id, nuevaEstado);

    await crearLog({
      usuario_id: 2, // temporal
      accion: 'actualizar_estado_orden',
      tabla: 'ordenes_trabajo',
      registro_id: orden.id
    });

    if (nuevaEstado === 'completada') {
      await crearProximaOrdenPorEquipo(orden.equipo_id);
    }

    res.json(orden);
  } catch (err) {
    console.error('❌ Error al actualizar estado:', err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

// 4b. Reprogramar orden
async function reprogramarOrden(req, res) {
  try {
    const { id } = req.params;
    const { fecha_programada } = req.body;

    const { rowCount, rows } = await db.query(
      `UPDATE ordenes_trabajo
       SET fecha_programada = $1, estado = 'pendiente'
       WHERE id = $2
       RETURNING *`,
      [fecha_programada, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    await crearLog({
      usuario_id: 2, // temporal
      accion: 'reprogramar_orden',
      tabla: 'ordenes_trabajo',
      registro_id: id,
    });

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al reprogramar orden:', err);
    res.status(500).json({ error: 'Error al reprogramar orden' });
  }
}

// 5. Detalle de orden
async function detalleOrden(req, res) {
  try {
    const orden = await getOrdenDetallada(req.params.id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(orden);
  } catch (err) {
    console.error('Error al obtener detalle de orden:', err);
    res.status(500).json({ error: err.message });
  }
}

// 6. Calendarización
async function calendarizarMantenimientos(req, res) {
  try {
    const { rows: equipos } = await db.query(`
      SELECT e.id AS equipo_id, p.id AS plan_id, p.frecuencia
      FROM equipos e
      JOIN planes_mantenimiento p ON e.plan_id = p.id
      WHERE p.activo = TRUE
    `);

    let totalOrdenes = 0;

    for (const equipo of equipos) {
      const semanas = FRECUENCIA_SEMANAS[equipo.frecuencia];
      if (!semanas) continue;

      const fecha = new Date();
      fecha.setDate(fecha.getDate() + semanas * 7);
      const fechaProgramada = fecha.toISOString().slice(0, 10);

      const insert = await db.query(`
        INSERT INTO ordenes_trabajo (equipo_id, plan_id, fecha_programada, estado)
        VALUES ($1, $2, $3, 'pendiente')
        RETURNING id
      `, [equipo.equipo_id, equipo.plan_id, fechaProgramada]);

      await crearLog({
        usuario_id: 2,
        accion: 'calendarizar_orden',
        tabla: 'ordenes_trabajo',
        registro_id: insert.rows[0].id
      });

      totalOrdenes++;
    }

    res.status(201).json({ mensaje: `Se calendarizaron ${totalOrdenes} órdenes` });
  } catch (error) {
    console.error("❌ Error al calendarizar mantenimientos:", error);
    res.status(500).json({ error: "Error al calendarizar mantenimientos" });
  }
}

// 7. Ejecutar orden
async function ejecutarOrden(req, res) {
  try {
    const ordenId = req.params.id;

    const { rows: ordenExistente } = await db.query(
      `
      SELECT estado, equipo_id, plan_id, fecha_programada
      FROM ordenes_trabajo
      WHERE id = $1
    `,
      [ordenId]
    );

    if (!ordenExistente.length) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (ordenExistente[0].estado === 'realizada') {
      return res.status(400).json({ error: "La orden ya ha sido ejecutada" });
    }

    const { equipo_id, plan_id, fecha_programada } = ordenExistente[0];
    const { observaciones } = req.body;

    await db.query(
      `
      UPDATE ordenes_trabajo
      SET estado = 'realizada',
          fecha_ejecucion = CURRENT_DATE,
          observaciones = COALESCE(observaciones, '{}'::jsonb) || $2::jsonb
      WHERE id = $1
    `,
      [ordenId, JSON.stringify(observaciones || {})]
    );

    const frecuenciaResult = await db.query(`
      SELECT frecuencia FROM planes_mantenimiento WHERE id = $1
    `, [plan_id]);

    const frecuencia = frecuenciaResult.rows[0].frecuencia;
    const semanas = FRECUENCIA_SEMANAS[frecuencia];
    if (!semanas) throw new Error("Frecuencia inválida");

    const proximaFecha = new Date(fecha_programada);
    proximaFecha.setDate(proximaFecha.getDate() + semanas * 7);

    const insert = await db.query(`
      INSERT INTO ordenes_trabajo (equipo_id, plan_id, fecha_programada, estado)
      VALUES ($1, $2, $3, 'pendiente')
      RETURNING id
    `, [equipo_id, plan_id, proximaFecha.toISOString().slice(0, 10)]);

    await crearLog({
      usuario_id: 2,
      accion: 'crear_proxima_orden',
      tabla: 'ordenes_trabajo',
      registro_id: insert.rows[0].id
    });

    res.json({ mensaje: "Orden ejecutada y próxima programada." });
  } catch (error) {
    console.error("❌ Error al ejecutar orden:", error);
    res.status(500).json({ error: "Error al ejecutar orden" });
  }
}

// 9. Equipos sin orden
async function equiposSinOrden(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT e.id AS equipo_id, e.nombre, e.ubicacion, e.criticidad, e.serie, p.nombre AS plan
      FROM equipos e
      JOIN planes_mantenimiento p ON e.plan_id = p.id
      WHERE p.activo = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM ordenes_trabajo ot
        WHERE ot.equipo_id = e.id AND ot.estado IN ('pendiente', 'reprogramada')
      )
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener equipos sin orden:", error);
    res.status(500).json({ error: "Error al obtener equipos sin orden" });
  }
}

// 10. Obtener órdenes pendientes asignadas
const obtenerOrdenesPendientesAsignadas = async (req, res) => {
  try {
    const user = req.user;
    const hoy = new Date();
    const hasta = endOfWeek(hoy, { weekStartsOn: 0 }); // Domingo siguiente

    const params = [hasta.toISOString().slice(0, 10)];
    let query = `
      SELECT o.*, e.nombre AS equipo_nombre, e.ubicacion, u.nombre AS responsable_nombre
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      LEFT JOIN usuarios u ON o.responsable = CAST(u.id AS VARCHAR)
      WHERE o.estado = 'pendiente'
        AND o.responsable IS NOT NULL
        AND o.fecha_programada <= $1
    `;

    if (user.rol_id === 3) {
      query += ` AND o.responsable = $2`;
      params.push(user.sub.toString()); // Asegúrate de que sea string si responsable es varchar
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener órdenes asignadas:", err);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
};

// 11. Obtener órdenes sin responsable
async function obtenerOrdenesSinResponsable(req, res) {
  try {
    const hoy = new Date();
    const hasta = endOfWeek(hoy, { weekStartsOn: 0 }); // Domingo siguiente

    const comparador = req.query.futuras === "true" ? ">" : "<=";

    const { rows } = await db.query(
      `
      SELECT o.*, e.nombre AS equipo_nombre, e.ubicacion
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      WHERE o.estado = 'pendiente'
        AND o.responsable IS NULL
        AND o.fecha_programada ${comparador} $1
    `,
      [hasta.toISOString().slice(0, 10)]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener órdenes sin responsable:", error);
    res.status(500).json({ error: "Error al obtener órdenes sin responsable" });
  }
}

// 12. Asignar responsable
async function asignarResponsableOrden(req, res) {
  try {
    const usuario = req.user;
    const { id } = req.params;
    const { responsable_id } = req.body;

    if (![1, 3, 5, 6].includes(usuario.rol_id)) {
      return res.status(403).json({ error: "No autorizado para asignar técnicos" });
    }

    if (!responsable_id) {
      return res.status(400).json({ error: "responsable_id es requerido" });
    }

    const { rowCount } = await db.query(`
      UPDATE ordenes_trabajo
      SET responsable = $1
      WHERE id = $2
    `, [responsable_id, id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    await crearLog({
      usuario_id: usuario.sub,
      accion: "asignar_responsable",
      tabla: "ordenes_trabajo",
      registro_id: id
    });

    res.json({ mensaje: "Responsable asignado correctamente" });

  } catch (error) {
    console.error("❌ Error al asignar responsable:", error);
    res.status(500).json({ error: "Error al asignar responsable" });
  }
}

// 13. Obtener órdenes ejecutadas por técnico
async function obtenerHistorial(req, res) {
  try {
    const user = req.user;
    const historial = await obtenerHistorialOrdenes(user);
    res.json(historial);
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}

// 14. Listar órdenes para validación
async function listarOrdenesParaValidacion(req, res) {
  try {
    const ordenes = await obtenerOrdenesEjecutadasNoValidadas();
    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes ejecutadas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// 15. Validar orden
async function validarOrden(req, res) {
  const { id } = req.params;
  const { validada, comentario } = req.body;
  const supervisor_id = req.user.id;

  try {
    const orden = await validarOrdenTrabajo(id, validada, comentario, supervisor_id);
    res.json({ mensaje: "Orden validada correctamente", orden }); // 👈 asegúrate de que sea 'orden'
  } catch (error) {
    console.error("Error al validar orden:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// 16. Obtener reporte firmado
async function obtenerReporteFirmado(req, res) {
  try {
    const { id } = req.params;
    const evidencia = await getEvidenciaReporte(id);
    if (!evidencia) {
      return res.status(404).json({ error: 'No hay reporte firmado para esta orden.' });
    }
    res.json(evidencia);
  } catch (error) {
    console.error('Error al obtener reporte firmado:', error);
    res.status(500).json({ error: 'Error al obtener el reporte.' });
  }
}

// 17. Obtener órdenes validadas
async function obtenerOrdenesValidadas(req, res) {
  try {
    const result = await db.query(
      `SELECT ot.*, eq.nombre AS equipo_nombre, eq.ubicacion
      FROM ordenes_trabajo ot
      JOIN equipos eq ON ot.equipo_id = eq.id
      WHERE ot.estado = 'validada'
      ORDER BY ot.fecha_ejecucion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes validadas:", error);
    res.status(500).json({ error: "Error al obtener órdenes validadas" });
  }
}

// 18. Generar reporte PDF con firmas
const generarPDF = async (req, res) => {
  try {
    const { firmaTecnico, firmaServicio } = req.body;
    const ordenId = req.params.id;

    // Obtener la orden con todos los datos
    const ordenQuery = await db.query(`
      SELECT ot.*, eq.nombre AS equipo_nombre, eq.ubicacion, u.nombre AS tecnico_nombre
      FROM ordenes_trabajo ot
      JOIN equipos eq ON ot.equipo_id = eq.id
      LEFT JOIN usuarios u ON ot.responsable = CAST(u.id AS VARCHAR)
      WHERE ot.id = $1
    `, [ordenId]);

    if (ordenQuery.rowCount === 0) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    const orden = ordenQuery.rows[0];

    // Validación previa (puedes extender esto si lo deseas)
    if (!firmaTecnico || !firmaServicio) {
      return res.status(400).json({ error: "Faltan una o ambas firmas." });
    }

    // Guardar firmas temporales
    const firmaTecnicoPath = path.join(
      __dirname,
      `../uploads/firmas/firmaTecnico_${randomUUID()}.png`
    );
    const firmaServicioPath = path.join(
      __dirname,
      `../uploads/firmas/firmaServicio_${randomUUID()}.png`
    );

    const firmaTBuffer = Buffer.from(firmaTecnico.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const firmaSBuffer = Buffer.from(firmaServicio.replace(/^data:image\/\w+;base64,/, ""), "base64");

    fs.writeFileSync(firmaTecnicoPath, firmaTBuffer);
    fs.writeFileSync(firmaServicioPath, firmaSBuffer);

    // Nombre del archivo PDF
    const nombreArchivo = `reporte_${orden.id}_${Date.now()}.pdf`;

    // Generar PDF
    const url = await generarReportePDF(orden, firmaTecnicoPath, firmaServicioPath, nombreArchivo);

    // Eliminar firmas temporales
    fs.unlinkSync(firmaTecnicoPath);
    fs.unlinkSync(firmaServicioPath);

    // 🔄 Cambiar estado de la orden a "firmada"
    await db.query(
      `UPDATE ordenes_trabajo SET estado = 'firmada' WHERE id = $1`,
      [ordenId]
    );

    // 📁 Guardar evidencia en la base de datos
    await db.query(`
      INSERT INTO evidencias (orden_id, url, tipo, subido_por)
      VALUES ($1, $2, $3, $4)
    `, [ordenId, `reportes/${nombreArchivo}`, 'reporte_firmado', orden.responsable]);

    // ✅ Devolver URL del PDF
    return res.json({ url });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return res.status(500).json({ error: "Error al generar el reporte." });
  }
};


// 19. Obtener todos los eventos (planificados y proyectados)
async function obtenerEventosCalendario(req, res) {
  try {
    const eventos = [];
    const { rol_id, sub: usuario_id } = req.user || {};
    const rolId = Number(rol_id);

    // 1. Obtener todas las órdenes reales (planificadas)
    let queryOrdenes = `
      SELECT ot.id, ot.equipo_id, ot.plan_id, ot.fecha_programada, ot.estado,
             ot.observaciones,
             eq.nombre, eq.serie, eq.criticidad, eq.ubicacion,
             pm.nombre AS plan, u.nombre AS responsable
      FROM ordenes_trabajo ot
      JOIN equipos eq ON ot.equipo_id = eq.id
      JOIN planes_mantenimiento pm ON eq.plan_id = pm.id
      LEFT JOIN usuarios u ON ot.responsable = CAST(u.id AS VARCHAR)`;

    const params = [];
    if (rolId === 2) {
      queryOrdenes += ` WHERE ot.responsable = $1`;
      params.push(usuario_id.toString());
    }

    const { rows: ordenes } = await db.query(queryOrdenes, params);

    // Eventos reales planificados
    ordenes.forEach((ot) => {
      eventos.push({
        id: ot.id,
        equipo_id: ot.equipo_id,
        title: ot.nombre,
        start: ot.fecha_programada,
        end: ot.fecha_programada,
        allDay: true,
        criticidad: ot.criticidad,
        estado: ot.estado,
        tipo: "planificado",
        ubicacion: ot.ubicacion,
        serie: ot.serie,
        plan: ot.plan,
        responsable: ot.responsable,
        observaciones: ot.observaciones,
      });
    });

    // 2. Proyecciones solo para roles con planificación
    if (rolId !== 2) {
      const { rows: ultimasOTs } = await db.query(`
        SELECT DISTINCT ON (e.id)
               e.id AS equipo_id,
               e.nombre,
               e.serie,
               e.ubicacion,
               e.criticidad,
               pm.frecuencia,
               pm.nombre AS plan,
               ot.fecha_programada AS ultima_fecha
        FROM equipos e
        JOIN planes_mantenimiento pm ON e.plan_id = pm.id
        JOIN ordenes_trabajo ot ON ot.equipo_id = e.id
        WHERE pm.activo = TRUE
        ORDER BY e.id, ot.fecha_programada DESC
      `);

      for (const eq of ultimasOTs) {
        const semanas = FRECUENCIA_SEMANAS[eq.frecuencia];
        if (!semanas || !eq.ultima_fecha) continue;

        const fechaBase = new Date(eq.ultima_fecha);
        const cantidadProyecciones = Math.floor(52 / semanas);

        for (let i = 1; i <= cantidadProyecciones; i++) {
          const proximaFecha = new Date(fechaBase);
          proximaFecha.setDate(proximaFecha.getDate() + i * semanas * 7);

          eventos.push({
            id: `p-${eq.equipo_id}-${i}`,
            equipo_id: eq.equipo_id,
            title: eq.nombre,
            start: proximaFecha.toISOString().slice(0, 10),
            end: proximaFecha.toISOString().slice(0, 10),
            allDay: true,
            criticidad: eq.criticidad,
            estado: "proyectado",
            tipo: "proyectado",
            ubicacion: eq.ubicacion,
            serie: eq.serie,
            plan: eq.plan,
          });
        }
      }
    }

    res.json(eventos);
  } catch (err) {
    console.error("❌ Error al obtener eventos del calendario:", err);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
}

// 20. Obtener cumplimiento por criticidad (fecha de hoy hacia atrás)
const obtenerCumplimientoPorCriticidad = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        LOWER(TRIM(e.criticidad)) AS criticidad,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE o.estado = 'firmada') AS firmadas
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      WHERE o.fecha_programada <= CURRENT_DATE
      GROUP BY criticidad
    `);

    const data = {
      critico: { total: 0, firmadas: 0 },
      relevante: { total: 0, firmadas: 0 }
    };

    for (const row of result.rows) {
      const key = row.criticidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (data[key]) {
        data[key].total = parseInt(row.total);
        data[key].firmadas = parseInt(row.firmadas);
      }
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener cumplimiento por criticidad:", err);
    res.status(500).json({ error: "Error al obtener cumplimiento por criticidad" });
  }
};


module.exports = {
  listarOrdenes,
  obtenerOrden,
  crearNuevaOrden,
  cambiarEstado,
  reprogramarOrden,
  detalleOrden,
  calendarizarMantenimientos,
  ejecutarOrden,
  equiposSinOrden,
  obtenerOrdenesPendientesAsignadas,
  obtenerOrdenesSinResponsable,
  asignarResponsableOrden,
  obtenerHistorial,
  listarOrdenesParaValidacion,
  validarOrden,
  obtenerReporteFirmado,
  obtenerOrdenesValidadas,
  generarPDF,
  obtenerEventosCalendario,
  obtenerCumplimientoPorCriticidad
};
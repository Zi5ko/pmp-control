// server/controllers/ordenesController.js
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { endOfWeek } = require("date-fns");
const generarReportePDF = require('../utils/generarReportes');

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
    const { rowCount: ordenesActivas } = await db.query(`
      SELECT 1 FROM ordenes_trabajo
      WHERE equipo_id = $1 AND estado IN ('pendiente', 'reprogramada')
      LIMIT 1
    `, [equipo_id]);

    if (ordenesActivas > 0) {
      return res.status(409).json({ error: "Ya existe una orden activa para este equipo." });
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

    const { rows: ordenExistente } = await db.query(`
      SELECT estado, equipo_id, plan_id, fecha_programada
      FROM ordenes_trabajo
      WHERE id = $1
    `, [ordenId]);

    if (!ordenExistente.length) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (ordenExistente[0].estado === 'realizada') {
      return res.status(400).json({ error: "La orden ya ha sido ejecutada" });
    }

    const { equipo_id, plan_id, fecha_programada } = ordenExistente[0];

    await db.query(`
      UPDATE ordenes_trabajo
      SET estado = 'realizada', fecha_ejecucion = CURRENT_DATE
      WHERE id = $1
    `, [ordenId]);

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
    const { rows } = await db.query(`
      SELECT o.*, e.nombre AS equipo_nombre, e.ubicacion
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      WHERE o.estado = 'pendiente' AND o.responsable IS NULL
    `);
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

    if (![1, 5, 6].includes(usuario.rol_id)) {
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
async function generarPDF(req, res) {
  try {
    const { id } = req.params;
    const { firmaTecnico, firmaServicio } = req.body;

    const orden = await getOrdenDetallada(id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    if (!firmaTecnico || !firmaServicio) {
      return res.status(400).json({ error: 'Firmas incompletas' });
    }

    // Generar rutas para archivos temporales
    const firmaTecnicoPath = path.join(__dirname, `../uploads/firmas/firma_tecnico_${orden.responsable}.png`);
    const firmaServicioPath = path.join(__dirname, `../uploads/firmas_servicio/firma_servicio_${id}.png`);

    // Asegurar directorios
    fs.mkdirSync(path.dirname(firmaTecnicoPath), { recursive: true });
    fs.mkdirSync(path.dirname(firmaServicioPath), { recursive: true });

    // Guardar archivos temporales
    fs.writeFileSync(firmaTecnicoPath, Buffer.from(firmaTecnico, 'base64'));
    fs.writeFileSync(firmaServicioPath, Buffer.from(firmaServicio, 'base64'));

    // Nombre del archivo PDF
    const nombreArchivo = `reporte_orden_${id}_${Date.now()}.pdf`;

    // Generar PDF
    const rutaPDF = await generarReportePDF(
      orden,
      firmaTecnicoPath,
      firmaServicioPath,
      nombreArchivo
    );

    // ✅ Limpieza de archivos temporales
    fs.unlinkSync(firmaTecnicoPath);
    fs.unlinkSync(firmaServicioPath);

    res.json({ success: true, url: rutaPDF });

  } catch (err) {
    console.error('Error al generar reporte:', err);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
}

// 19. Obtener todos los eventos (planificados y proyectados)
async function obtenerEventosCalendario(req, res) {
  try {
    const eventos = [];

    // 1. Obtener todas las órdenes reales (planificadas)
    const { rows: ordenes } = await db.query(`
      SELECT ot.id, ot.equipo_id, ot.plan_id, ot.fecha_programada, ot.estado,
             eq.nombre, eq.serie, eq.criticidad, eq.ubicacion,
             pm.nombre AS plan
      FROM ordenes_trabajo ot
      JOIN equipos eq ON ot.equipo_id = eq.id
      JOIN planes_mantenimiento pm ON eq.plan_id = pm.id
    `);

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
      });
    });

    // 2. Obtener última OT registrada por equipo (independiente del estado)
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

    res.json(eventos);
  } catch (err) {
    console.error("❌ Error al obtener eventos del calendario:", err);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
}

module.exports = {
  listarOrdenes,
  obtenerOrden,
  crearNuevaOrden,
  cambiarEstado,
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
  obtenerEventosCalendario
};
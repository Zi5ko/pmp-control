//server/controllers/ordenesController.js
const {
  getOrdenes,
  getOrdenById,
  crearOrden,
  actualizarEstadoOrden,
  getOrdenDetallada
} = require('../models/ordenesModel');

const { crearLog } = require('../models/logsAuditoriaModel');
const db = require('../db');
const { endOfWeek } = require("date-fns");

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

// 8. Proyección
async function proyeccionMantenimientos(req, res) {
  try {
    const { rows: equipos } = await db.query(`
      SELECT e.id AS equipo_id, e.nombre, e.ubicacion, p.frecuencia
      FROM equipos e
      JOIN planes_mantenimiento p ON e.plan_id = p.id
      WHERE p.activo = TRUE
    `);

    const proyecciones = [];
    const hoy = new Date();

    for (const equipo of equipos) {
      const semanas = FRECUENCIA_SEMANAS[equipo.frecuencia];
      if (!semanas) continue;

      const { rows: ultimaOrden } = await db.query(`
        SELECT fecha_programada
        FROM ordenes_trabajo
        WHERE equipo_id = $1
        ORDER BY fecha_ejecucion DESC NULLS LAST, fecha_programada ASC
        LIMIT 1
      `, [equipo.equipo_id]);

      const fechaBase = new Date(ultimaOrden[0]?.fecha_programada || hoy);

      for (let i = 1; i <= 52 / semanas; i++) {
        const proximaFecha = new Date(fechaBase);
        proximaFecha.setDate(proximaFecha.getDate() + (semanas * 7 * i));

        proyecciones.push({
          equipo_id: equipo.equipo_id,
          nombre: equipo.nombre,
          ubicacion: equipo.ubicacion,
          fecha: proximaFecha.toISOString().slice(0, 10)
        });
      }
    }

    res.json(proyecciones);
  } catch (error) {
    console.error("❌ Error al obtener proyección de mantenimientos:", error);
    res.status(500).json({ error: "Error al generar proyección" });
  }
}

// 9. Equipos sin orden
async function equiposSinOrden(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT e.id AS equipo_id, e.nombre, e.ubicacion, e.criticidad, p.frecuencia
      FROM equipos e
      JOIN planes_mantenimiento p ON e.plan_id = p.id
      WHERE p.activo = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM ordenes_trabajo ot
        WHERE ot.equipo_id = e.id
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

    if (![1, 4, 5].includes(usuario.rol_id)) {
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

async function obtenerOrdenesEjecutadasPorTecnico(req, res) {
  try {
    const user = req.user;

    const { rows } = await db.query(`
      SELECT o.*, e.nombre AS equipo_nombre, e.ubicacion
      FROM ordenes_trabajo o
      JOIN equipos e ON o.equipo_id = e.id
      WHERE o.estado = 'realizada'
        AND o.responsable = $1
      ORDER BY o.fecha_ejecucion DESC
    `, [user.sub]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener órdenes realizadas:", error);
    res.status(500).json({ error: "Error al obtener órdenes realizadas" });
  }
}

// Exports
module.exports = {
  listarOrdenes,
  obtenerOrden,
  crearNuevaOrden,
  cambiarEstado,
  detalleOrden,
  calendarizarMantenimientos,
  ejecutarOrden,
  proyeccionMantenimientos,
  equiposSinOrden,
  obtenerOrdenesPendientesAsignadas,
  obtenerOrdenesSinResponsable,
  asignarResponsableOrden,
  obtenerOrdenesEjecutadasPorTecnico
};
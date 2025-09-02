//server/routes/ordenesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middlewares/auth');
const validarEstadoOrden = require('../middlewares/orders');

const {
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
  asignarResponsableOrden,
  obtenerOrdenesSinResponsable,
  obtenerHistorial,
  listarOrdenesParaValidacion,
  validarOrden,
  obtenerReporteFirmado,
  obtenerOrdenesValidadas,
  generarPDF,
  obtenerEventosCalendario,
  obtenerCumplimientoPorCriticidad
} = require('../controllers/ordenesController');

// Rutas principales
router.get('/', listarOrdenes);
router.get('/ordenes/:id', obtenerOrden);
router.post('/', crearNuevaOrden);
router.put('/:id/estado', cambiarEstado);
router.put('/:id/reprogramar', reprogramarOrden);
router.get('/:id/detalle', detalleOrden);
router.put('/:id', validarEstadoOrden, validarOrden);

// Rutas adicionales
router.get("/resumen", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE estado IN ('firmada')) AS completadas,
        COUNT(*) FILTER (WHERE estado IN ('realizada', 'pendiente', 'asignada', 'validada')) AS pendientes
      FROM ordenes_trabajo;
    `);

    res.json({
      total: parseInt(result.rows[0].total),
      completadas: parseInt(result.rows[0].completadas),
      pendientes: parseInt(result.rows[0].pendientes),
    });
  } catch (err) {
    console.error("❌ Error al obtener resumen de ordenes:", err);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});
router.get('/cumplimiento-criticidad', obtenerCumplimientoPorCriticidad);

// Rutas para validación y ejecución de órdenes
router.get("/ejecutadas/no-validadas", verifyToken, listarOrdenesParaValidacion);
router.put("/:id/validar", verifyToken, validarOrden);
router.post('/calendarizar', calendarizarMantenimientos);
router.put('/:id/ejecutar', ejecutarOrden);
router.get('/faltantes', equiposSinOrden);
router.get('/pendientes-asignadas', verifyToken, obtenerOrdenesPendientesAsignadas);
router.get('/pendientes-sin-responsable', verifyToken, obtenerOrdenesSinResponsable);
router.put('/:id/asignar', verifyToken, asignarResponsableOrden);
router.get('/historial', verifyToken, obtenerHistorial);
router.post('/:id/generar-reporte', verifyToken, generarPDF);
router.get('/:id/reporte', obtenerReporteFirmado);
router.get("/validadas", obtenerOrdenesValidadas);
router.get("/eventos", verifyToken, obtenerEventosCalendario);

module.exports = router;
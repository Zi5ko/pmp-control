//server/routes/ordenesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middlewares/auth');

const {
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
  asignarResponsableOrden,
  obtenerOrdenesSinResponsable,
  obtenerOrdenesEjecutadasPorTecnico
} = require('../controllers/ordenesController');

// Rutas principales
router.get('/', listarOrdenes);
router.get('/ordenes/:id', obtenerOrden);
router.post('/', crearNuevaOrden);
router.put('/:id/estado', cambiarEstado);
router.get('/:id/detalle', detalleOrden);

// Rutas adicionales
router.get("/resumen", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE estado = 'realizada') AS completadas,
        COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes
      FROM ordenes_trabajo
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al obtener resumen de ordenes:", err);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});

router.post('/calendarizar', calendarizarMantenimientos);
router.put('/:id/ejecutar', ejecutarOrden);
router.get('/proyeccion', proyeccionMantenimientos);
router.get('/faltantes', equiposSinOrden);
router.get('/pendientes-asignadas', verifyToken, obtenerOrdenesPendientesAsignadas);
router.get('/pendientes-sin-responsable', verifyToken, obtenerOrdenesSinResponsable);
router.put('/:id/asignar', verifyToken, asignarResponsableOrden);
router.get("/realizadas", verifyToken, obtenerOrdenesEjecutadasPorTecnico);

module.exports = router;
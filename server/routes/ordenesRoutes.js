const express = require('express');
const router = express.Router();
const {
  listarOrdenes,
  obtenerOrden,
  crearNuevaOrden,
  cambiarEstado,
  detalleOrden
} = require('../controllers/ordenesController');

// GET /api/ordenes
router.get('/ordenes', listarOrdenes);

// GET /api/ordenes/:id
router.get('/ordenes/:id', obtenerOrden);

// POST /api/ordenes
router.post('/ordenes', crearNuevaOrden);

// PUT /api/ordenes/:id/estado
router.put('/ordenes/:id/estado', cambiarEstado);

router.get('/ordenes/:id/detalle', detalleOrden);

module.exports = router;

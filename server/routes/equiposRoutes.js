// server/routes/equiposRoutes.js
const router = require("express").Router();
const equiposController = require("../controllers/equiposController");

// POST /api/equipos - Registrar nuevo equipo
router.post("/", equiposController.registrarEquipo);

// GET /api/equipos - Obtener todos los equipos
router.get("/", equiposController.obtenerEquipos);

// GET /api/equipos/resumen - Obtener resumen por criticidad
router.get("/resumen", equiposController.resumenEquipos);

module.exports = router;
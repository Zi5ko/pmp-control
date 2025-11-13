// server/routes/equiposRoutes.js
const router = require("express").Router();
const equiposController = require("../controllers/equiposController");

// POST /api/equipos - Registrar nuevo equipo
router.post("/", equiposController.registrarEquipo);

  try {
    const result = await db.query(
      `INSERT INTO equipos (nombre, familia, criticidad, ubicacion, marca, modelo, serie, fecha_ingreso, plan_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8)
       RETURNING *`,
      [nombre, familia, criticidad, ubicacion, marca, modelo, serie, plan_id]
    );

// GET /api/equipos/resumen - Obtener resumen por criticidad
router.get("/resumen", equiposController.resumenEquipos);

module.exports = router;
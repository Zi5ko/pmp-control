const router = require('express').Router();
const db = require('../db');

// Registrar un nuevo equipo
router.post('/', async (req, res) => {
  const { familia, criticidad, ubicacion, marca, modelo, serie, plan_id } = req.body;
  const nombre = `${familia} ${marca} ${modelo}`;

  try {
    const result = await db.query(
      `INSERT INTO equipos (nombre, familia, criticidad, ubicacion, marca, modelo, serie, fecha_ingreso, plan_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8)
       RETURNING *`,
      [nombre, familia, criticidad, ubicacion, marca, modelo, serie, plan_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar equipo:", err);
    res.status(500).json({ error: 'No se pudo registrar el equipo' });
  }
});

// Obtener todos los equipos
router.get('/', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT e.*, p.nombre AS nombre_plan, p.tipo AS tipo_plan
        FROM equipos e
        LEFT JOIN planes_mantenimiento p ON e.plan_id = p.id
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener equipos:", err);
      res.status(500).json({ error: 'No se pudieron obtener los equipos' });
    }
  });

  // GET /api/equipos/resumen
router.get("/resumen", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_equipos,
        COUNT(*) FILTER (WHERE criticidad = 'Crítico') AS criticos,
        COUNT(*) FILTER (WHERE criticidad = 'Relevante') AS relevantes,
        COUNT(*) FILTER (WHERE criticidad = 'Instalación relevante') AS instalaciones_relevantes
      FROM equipos;
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al obtener resumen de equipos:", err);
    res.status(500).json({ error: "Error al obtener resumen de equipos" });
  }
});

module.exports = router;
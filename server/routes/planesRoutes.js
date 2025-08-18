const router = require('express').Router();
const db = require('../db');

router.get('/', async (_req, res) => {
  try {
    const result = await db.query('SELECT id, nombre FROM planes_mantenimiento WHERE activo = true');
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener planes:", err);
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

module.exports = router;
const router = require('express').Router();
const db = require('../db');
const { verifyToken } = require('../middlewares/auth');
const { permitirRoles } = require('../middlewares/roles');

// Listar planes activos (incluye campos para tabla)
router.get('/', async (_req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, tipo, frecuencia FROM planes_mantenimiento WHERE activo = true ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener planes:", err);
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

// Crear nuevo plan de mantenimiento
router.post(
  '/',
  verifyToken,
  permitirRoles([1, 5, 6]),
  async (req, res) => {
    try {
      const { nombre, tipo, frecuencia } = req.body || {};

      if (!nombre || !tipo) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre y tipo' });
      }

      // Validaciones
      const tiposPermitidos = ['garantía', 'contrato', 'ninguno'];
      const frecuenciasPermitidas = ['mensual', 'trimestral', 'semestral', 'anual', null, undefined, ''];

      if (!tiposPermitidos.includes(String(tipo).toLowerCase())) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }

      const freqNorm = frecuencia ? String(frecuencia).toLowerCase() : null;
      if (!frecuenciasPermitidas.includes(freqNorm)) {
        return res.status(400).json({ error: 'Frecuencia inválida' });
      }

      const insert = await db.query(
        `INSERT INTO planes_mantenimiento (nombre, tipo, frecuencia, protocolo_base, activo)
         VALUES ($1, $2, $3, NULL, TRUE)
         RETURNING id, nombre, tipo, frecuencia`,
        [nombre, String(tipo).toLowerCase(), freqNorm]
      );

      return res.status(201).json(insert.rows[0]);
    } catch (err) {
      console.error('Error al crear plan:', err);
      return res.status(500).json({ error: 'Error al crear plan' });
    }
  }
);

module.exports = router;

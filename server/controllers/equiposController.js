// server/controllers/equiposController.js
const db = require("../db");

// Registrar nuevo equipo con verificación de duplicados
exports.registrarEquipo = async (req, res) => {
  const { familia, criticidad, ubicacion, marca, modelo, serie, plan_id } = req.body;
  const nombre = `${familia} ${marca} ${modelo}`;
  const fecha_ingreso = new Date().toISOString().split("T")[0];

  try {
    const existe = await db.query(`
      SELECT 1 FROM equipos
      WHERE marca = $1 AND modelo = $2 AND serie = $3
    `, [marca, modelo, serie]);

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ya existe un equipo con la misma marca, modelo y número de serie." });
    }

    const result = await db.query(`
      INSERT INTO equipos (nombre, familia, criticidad, ubicacion, marca, modelo, serie, fecha_ingreso, plan_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [nombre, familia, criticidad, ubicacion, marca, modelo, serie, fecha_ingreso, plan_id]);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar equipo:", err);
    return res.status(500).json({ error: "No se pudo registrar el equipo" });
  }
};

// Obtener todos los equipos
exports.obtenerEquipos = async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT e.*, p.nombre AS nombre_plan, p.tipo AS tipo_plan
      FROM equipos e
      LEFT JOIN planes_mantenimiento p ON e.plan_id = p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener equipos:", err);
    res.status(500).json({ error: "No se pudieron obtener los equipos" });
  }
};

// Obtener resumen de criticidad
exports.resumenEquipos = async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_equipos,
        COUNT(*) FILTER (WHERE criticidad = 'Crítico') AS criticos,
        COUNT(*) FILTER (WHERE criticidad = 'Relevante') AS relevantes,
        COUNT(*) FILTER (WHERE criticidad = 'Instalación relevante') AS instalaciones_relevantes
      FROM equipos
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al obtener resumen de equipos:", err);
    res.status(500).json({ error: "Error al obtener resumen de equipos" });
  }
};
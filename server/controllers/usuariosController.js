const { getUsuarios } = require('../models/usuariosModel');
const db = require("../db");

async function listarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al listar usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// Controlador para obtener técnicos
const obtenerTecnicos = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, nombre, email
      FROM usuarios
      WHERE rol_id = 2
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener técnicos:", error);
    res.status(500).json({ error: "Error al obtener técnicos" });
  }
};

module.exports = {
  listarUsuarios,
  obtenerTecnicos
};

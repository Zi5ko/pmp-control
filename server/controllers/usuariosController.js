const { getUsuarios } = require('../models/usuariosModel');

async function listarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al listar usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

module.exports = {
  listarUsuarios
};

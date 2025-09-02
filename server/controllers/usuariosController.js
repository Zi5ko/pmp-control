const {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../models/usuariosModel');
const db = require('../db');
const bcrypt = require('bcryptjs');

// Genera una clave por defecto sencilla a partir del nombre
function generarClave(nombre) {
  const primerNombre = nombre.split(' ')[0].toLowerCase();
  return `${primerNombre}123`;
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al listar usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

async function crearUsuarioCtrl(req, res) {
  try {
    const { nombre, email, rol_id, tipo } = req.body;

    let password_hash = null;
    let password = null;

    if (tipo === 'local') {
      password = generarClave(nombre);
      password_hash = await bcrypt.hash(password, 10);
    }

    const nuevoUsuario = await crearUsuario({
      nombre,
      email,
      password_hash,
      rol_id,
    });

    res.status(201).json({ ...nuevoUsuario, password });
  } catch (err) {
    console.error('Error al crear usuario:', err.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

async function actualizarUsuarioCtrl(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email, rol_id } = req.body;

    const actualizado = await actualizarUsuario(id, { nombre, email, rol_id });
    res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar usuario:', err.message);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

async function eliminarUsuarioCtrl(req, res) {
  try {
    const { id } = req.params;
    await eliminarUsuario(id);
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar usuario:', err.message);
    res.status(500).json({ error: 'Error al eliminar usuario' });
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
    console.error('❌ Error al obtener técnicos:', error);
    res.status(500).json({ error: 'Error al obtener técnicos' });
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario: crearUsuarioCtrl,
  actualizarUsuario: actualizarUsuarioCtrl,
  eliminarUsuario: eliminarUsuarioCtrl,
  obtenerTecnicos,
};


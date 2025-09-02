const { getRoles } = require('../models/rolesModel');

async function listarRoles(_req, res) {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (err) {
    console.error('Error al obtener roles:', err.message);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
}

module.exports = { listarRoles };

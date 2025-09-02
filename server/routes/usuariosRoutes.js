// server/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

const {
  listarUsuarios,
  obtenerTecnicos,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuariosController');

router.get('/', verifyToken, listarUsuarios);
router.post('/', verifyToken, crearUsuario);
router.put('/:id', verifyToken, actualizarUsuario);
router.delete('/:id', verifyToken, eliminarUsuario);

router.get('/tecnicos', verifyToken, obtenerTecnicos);

module.exports = router;


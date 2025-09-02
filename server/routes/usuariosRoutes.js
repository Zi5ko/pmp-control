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

router.get('/usuarios', verifyToken, listarUsuarios);
router.post('/usuarios', verifyToken, crearUsuario);
router.put('/usuarios/:id', verifyToken, actualizarUsuario);
router.delete('/usuarios/:id', verifyToken, eliminarUsuario);

router.get('/tecnicos', verifyToken, obtenerTecnicos);

module.exports = router;


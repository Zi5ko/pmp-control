// server/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

// OJO: el nombre y la ruta del archivo deben coincidir EXACTO
// con el que creaste en controllers (plural/singular, mayúsculas/minúsculas)
const {
    listarUsuarios,
    obtenerTecnicos
 } = require('../controllers/usuariosController');

// No llames a la función aquí (NO uses paréntesis)
router.get('/usuarios', listarUsuarios);


// Importar el controlador de usuarios

router.get("/tecnicos", verifyToken, obtenerTecnicos);

module.exports = router;
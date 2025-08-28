// server/routes/alertasRoutes.js
const express = require('express');
const router = express.Router();
const { generarAlertas, obtenerAlertas } = require('../controllers/alertasController');
const { verifyToken } = require('../middlewares/auth');

router.get('/generar', verifyToken, generarAlertas);
router.get('/', verifyToken, obtenerAlertas);

module.exports = router;
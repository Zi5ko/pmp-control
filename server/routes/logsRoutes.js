//server/routes/logsRoutes.js
const express = require('express');
const router = express.Router();
const { getLogs, exportarLogsExcel } = require('../controllers/logsAuditoriaController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getLogs);
router.get('/excel', verifyToken, exportarLogsExcel);

module.exports = router;

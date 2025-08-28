//server/routes/logsRoutes.js
const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logsAuditoriaController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, getLogs);

module.exports = router;
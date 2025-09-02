const express = require('express');
const router = express.Router();
const { listarRoles } = require('../controllers/rolesController');

router.get('/', listarRoles);

module.exports = router;

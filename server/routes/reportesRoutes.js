//server/routes/reportesRoutes.js
const express = require("express");
const router = express.Router();
const { descargarPDF } = require("../controllers/reportesController");
const { verifyToken } = require("../middlewares/auth");

router.get("/descargar/:nombreArchivo", verifyToken, descargarPDF);

module.exports = router;
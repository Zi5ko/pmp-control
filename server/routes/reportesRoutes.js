//server/routes/reportesRoutes.js
const express = require("express");
const router = express.Router();
const { descargarPDF } = require("../controllers/reportesController");
const auth = require("../middlewares/auth");

router.get("/descargar/:nombreArchivo", auth, descargarPDF);

module.exports = router;
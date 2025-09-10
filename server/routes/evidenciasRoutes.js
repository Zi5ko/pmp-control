// server/routes/evidenciasRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { subirEvidencia, listarEvidencias, eliminarEvidencia } = require('../controllers/evidenciasController');
const { verifyToken } = require('../middlewares/auth');

// Carpeta de destino
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'evidencias');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});

// Filtro por tipo de archivo
const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (extensionesPermitidas.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

// Ruta protegida y única
router.post('/', verifyToken, upload.single('archivo'), subirEvidencia);

// Ruta para descargar reportes PDF
const { descargarPDF } = require('../controllers/reportesController');
router.get('/descargar/:nombreArchivo', descargarPDF);

// Listar evidencias de una orden
router.get('/:ordenId', verifyToken, listarEvidencias);

// Eliminar evidencia por id
router.delete('/:id', verifyToken, eliminarEvidencia);

module.exports = router;

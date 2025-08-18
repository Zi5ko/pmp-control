// server/routes/evidenciasRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { subirEvidencia } = require('../controllers/evidenciasController');
const { verifyToken } = require('../middlewares/auth');

// Carpeta de destino
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
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

module.exports = router;
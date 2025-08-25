const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/firmas_servicio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const { orden_id } = req.body;
    cb(null, `${orden_id}_firma.png`);
  }
});

const upload = multer({ storage });

router.post('/servicio', upload.single('firma'), (req, res) => {
  res.json({ success: true, url: `/uploads/firmas_servicio/${req.file.filename}` });
});

module.exports = router;
//server/controllers/reportesController.js
const path = require("path");
const fs = require("fs");

// Descargar un PDF protegido
exports.descargarPDF = (req, res) => {
  const { nombreArchivo } = req.params;

  if (!nombreArchivo.endsWith(".pdf")) {
    return res.status(400).json({ error: "Tipo de archivo no permitido" });
  }

  const ruta = path.join(__dirname, "../uploads/reportes", nombreArchivo);

  if (!fs.existsSync(ruta)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  // Si necesitas validar roles: req.user.rol_id o req.user.rol_nombre
  res.download(ruta, nombreArchivo); // Envia el archivo como descarga
};
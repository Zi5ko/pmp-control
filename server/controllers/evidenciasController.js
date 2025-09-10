// server/controllers/evidenciasController.js
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { agregarEvidencia, obtenerEvidenciasPorOrden, obtenerEvidenciaPorId, eliminarEvidencia: eliminarEvidenciaDB } = require('../models/evidenciasModel');
const { crearLog } = require('../models/logsAuditoriaModel');

async function subirEvidencia(req, res) {
  try {
    // Validación básica
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no recibido' });
    }

    const { orden_id } = req.body;
    const archivo = req.file;
    const extension = path.extname(archivo.originalname).toLowerCase(); // tipo de archivo

    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const usuario_id = req.user.sub; // desde el JWT

    // Registro en base de datos
    const relativePath = path.join('evidencias', archivo.filename).replace(/\\/g, '/');

    const evidencia = await agregarEvidencia({
      orden_id,
      url: relativePath,
      tipo: extension,
      subido_por: usuario_id
    });

    // Log de auditoría
    await crearLog({
      usuario_id,
      accion: 'subir_evidencia',
      tabla: 'evidencias',
      registro_id: evidencia.id
    });

    res.status(201).json({
      mensaje: 'Evidencia subida con éxito',
      evidencia
    });

  } catch (err) {
    console.error("❌ Error al subir evidencia:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al subir evidencia" });
  }
}

async function listarEvidencias(req, res) {
  try {
    const { ordenId } = req.params;
    const evidencias = await obtenerEvidenciasPorOrden(ordenId);
    res.json(evidencias);
  } catch (err) {
    console.error("❌ Error al obtener evidencias:", err);
    res.status(500).json({ error: "Error al obtener evidencias" });
  }
}

module.exports = {
  subirEvidencia,
  listarEvidencias,
  async eliminarEvidencia(req, res) {
    try {
      const { id } = req.params;
      const evidencia = await obtenerEvidenciaPorId(id);
      if (!evidencia) return res.status(404).json({ error: 'Evidencia no encontrada' });

      // Eliminar archivo físico si existe
      const filePath = path.join(__dirname, '..', 'uploads', evidencia.url.replace(/^\\/,'').replace(/^uploads[\\/]/,''));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn('No se pudo eliminar el archivo de evidencia:', e.message);
      }

      const eliminada = await eliminarEvidenciaDB(id);

      // Log auditoría
      if (req.user?.sub) {
        await crearLog({
          usuario_id: req.user.sub,
          accion: 'eliminar_evidencia',
          tabla: 'evidencias',
          registro_id: eliminada?.id || id
        });
      }

      return res.json({ mensaje: 'Evidencia eliminada', evidencia: eliminada });
    } catch (err) {
      console.error('❌ Error al eliminar evidencia:', err);
      return res.status(500).json({ error: 'Error al eliminar evidencia' });
    }
  }
};

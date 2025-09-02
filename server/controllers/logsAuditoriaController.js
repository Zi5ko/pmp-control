const { obtenerLogsAuditoria } = require('../models/logsAuditoriaModel');

exports.getLogs = async (req, res) => {
  try {
    const rol_id = req.user.rol_id;
    if (![1, 3, 5, 6].includes(rol_id)) {
      return res.status(403).json({ error: 'No autorizado para ver logs de auditoría' });
    }

    const logs = await obtenerLogsAuditoria();
    res.json(logs);
  } catch (error) {
    console.error("❌ Error al obtener logs de auditoría:", error);
    res.status(500).json({ error: "Error al obtener logs de auditoría" });
  }
};
const { obtenerLogsAuditoria } = require('../models/logsAuditoriaModel');

exports.getLogs = async (req, res) => {
  try {
    const rol_id = req.user.rol_id;
    // Permitir acceso a Admin(1), Supervisor(3), Calidad(4), Responsable(5), ESMP(6)
    if (![1, 3, 4, 5, 6].includes(rol_id)) {
      return res.status(403).json({ error: 'No autorizado para ver logs de auditoría' });
    }

    const logs = await obtenerLogsAuditoria();
    res.json(logs);
  } catch (error) {
    console.error("❌ Error al obtener logs de auditoría:", error);
    res.status(500).json({ error: "Error al obtener logs de auditoría" });
  }
};

const { obtenerLogsAuditoria } = require('../models/logsAuditoriaModel');
const ExcelJS = require('exceljs');

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

// Descargar logs de auditoría como Excel
exports.exportarLogsExcel = async (req, res) => {
  try {
    const rol_id = req.user.rol_id;
    if (![1, 3, 4, 5, 6].includes(rol_id)) {
      return res.status(403).json({ error: 'No autorizado para exportar logs de auditoría' });
    }

    const logs = await obtenerLogsAuditoria();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Logs Auditoría');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 30 },
      { header: 'Acción', key: 'accion', width: 30 },
      { header: 'Tabla', key: 'tabla_afectada', width: 25 },
      { header: 'Registro ID', key: 'registro_id', width: 15 },
    ];

    logs.forEach((log) => {
      sheet.addRow({
        id: log.id,
        fecha: log.fecha ? new Date(log.fecha).toISOString().replace('T', ' ').slice(0, 19) : '',
        usuario: log.usuario || '',
        accion: log.accion || '',
        tabla_afectada: log.tabla_afectada || '',
        registro_id: log.registro_id || '',
      });
    });

    const filename = `logs_auditoria_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('❌ Error al exportar logs a Excel:', error);
    res.status(500).json({ error: 'Error al exportar logs a Excel' });
  }
};

// server/utils/generarReportes.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

async function generarReportePDF(orden, firmaTecnicoPath, firmaServicioPath, nombreArchivo) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const ruta = path.join(__dirname, '../uploads/reportes', nombreArchivo);
    const stream = fs.createWriteStream(ruta);

    doc.pipe(stream);

    // Cabecera
    doc.fontSize(16).text('Informe de Mantenimiento Validado', { align: 'center' });
    doc.moveDown();

    // Datos principales
    doc.fontSize(12)
      .text(`Equipo: ${orden.equipo_nombre}`)
      .text(`Ubicación: ${orden.ubicacion}`)
      .text(`Fecha de ejecución: ${moment(orden.fecha_ejecucion).format('DD-MM-YYYY')}`)
      .text(`Técnico responsable: ${orden.tecnico_nombre}`)
      .text(`Estado: ${orden.estado}`)
      .moveDown();

    // Observaciones
    if (orden.observaciones) {
      doc.text('Observaciones:')
        .font('Helvetica-Oblique')
        .text(orden.observaciones)
        .moveDown();
    }

    // Firmas
    doc.text('Firmas:', { underline: true }).moveDown();

    if (firmaTecnicoPath) {
      doc.text('Técnico:', { continued: true });
      doc.image(firmaTecnicoPath, { width: 100, height: 50 });
    }

    if (firmaServicioPath) {
      doc.moveDown().text('Encargado del Servicio Clínico:', { continued: true });
      doc.image(firmaServicioPath, { width: 100, height: 50 });
    }

    doc.end();

    stream.on('finish', () => {
      resolve(`/uploads/reportes/${nombreArchivo}`);
    });

    stream.on('error', (err) => reject(err));
  });
}

module.exports = generarReportePDF;
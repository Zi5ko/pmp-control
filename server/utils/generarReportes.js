// server/utils/generarReportes.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

async function generarReportePDF(orden, firmaTecnicoPath, firmaServicioPath, nombreArchivo) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const ruta = path.join(__dirname, '../uploads/reportes', nombreArchivo);
    const stream = fs.createWriteStream(ruta);

    doc.pipe(stream);
    
    doc.image(path.join(__dirname, '../assets/logo.png'), 50, 45, { width: 80 });
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Nombre de la Empresa', 150, 57);

    // Cabecera
    doc
      .font('Helvetica')
      .fontSize(16)
      .text('Informe de Mantenimiento Validado', { align: 'center' });

    const infoTop = 130;
    doc
      .fontSize(12)
      .text('Equipo:', 50, infoTop)
      .text(orden.equipo_nombre, 150, infoTop)
      .text('Ubicación:', 50, infoTop + 20)
      .text(orden.ubicacion, 150, infoTop + 20)
      .text('Fecha de ejecución:', 50, infoTop + 40)
      .text(moment(orden.fecha_ejecucion).format('DD-MM-YYYY'), 150, infoTop + 40)
      .text('Técnico responsable:', 50, infoTop + 60)
      .text(orden.tecnico_nombre, 150, infoTop + 60)
      .text('Estado:', 50, infoTop + 80)
      .text(orden.estado, 150, infoTop + 80);
    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();

    // Observaciones
    if (orden.observaciones) {
      doc
        .moveDown()
        .font('Helvetica')
        .text('Observaciones:')
        .font('Helvetica-Oblique')
        .text(orden.observaciones, { width: 500 });
    }
    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();

    // Firmas
    const firmasTop = doc.y + 20;
    doc.font('Helvetica-Bold').text('Técnico', 50, firmasTop);
    if (firmaTecnicoPath) {
      doc.image(firmaTecnicoPath, 50, firmasTop + 15, { width: 100 });
    }
    doc.font('Helvetica-Bold').text('Encargado del Servicio', 300, firmasTop);
    if (firmaServicioPath) {
      doc.image(firmaServicioPath, 300, firmasTop + 15, { width: 100 });
    }

    const addFooter = () => {
      doc
        .fontSize(8)
        .text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, 760, { align: 'left' })
        .text(`Página ${doc.page.number}`, 0, 760, { align: 'center' });
    };
    addFooter();
    doc.on('pageAdded', addFooter);

    doc.end();

    stream.on('finish', () => {
      resolve(`/uploads/reportes/${nombreArchivo}`);
    });

    stream.on('error', (err) => reject(err));
  });
}

module.exports = generarReportePDF;

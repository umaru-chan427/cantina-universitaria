import { jsPDF } from 'jspdf';

/**
 * Genera el PDF de una factura/comprobante.
 * @param {object} factura - { numero_display, razon_social, ruc_documento, total, metodo_pago, emitida_en, items: [{nombre, cantidad, precio_unitario, subtotal}] }
 * @returns {jsPDF} instancia lista para .save() o .output()
 */
export function generarPdfFactura(factura) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 150] }); // formato ticket angosto
  const margen = 6;
  let y = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('La Cafetería Provending', margen, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Comprobante de venta simplificado', margen, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`N°: ${factura.numero_display}`, margen, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(factura.emitida_en).toLocaleString('es-PY')}`, margen, y);
  y += 4;
  doc.text(`Pedido: ${factura.codigo_ticket}`, margen, y);
  y += 4;
  doc.text(`Cliente: ${factura.razon_social || 'Consumidor final'}`, margen, y);
  y += 4;
  doc.text(`RUC/C.I.: ${factura.ruc_documento || 'Sin RUC'}`, margen, y);
  y += 4;
  doc.text(`Pago: ${factura.metodo_pago || '-'}`, margen, y);
  y += 6;

  doc.setLineWidth(0.2);
  doc.line(margen, y, 80 - margen, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cant.', margen, y);
  doc.text('Detalle', margen + 10, y);
  doc.text('Subtotal', 80 - margen, y, { align: 'right' });
  y += 4;
  doc.setFont('helvetica', 'normal');

  (factura.items || []).forEach((it) => {
    doc.text(String(it.cantidad), margen, y);
    const nombre = doc.splitTextToSize(it.nombre, 38);
    doc.text(nombre, margen + 10, y);
    doc.text(`Gs. ${Number(it.subtotal).toLocaleString('es-PY')}`, 80 - margen, y, { align: 'right' });
    y += 4 * nombre.length;
  });

  y += 2;
  doc.line(margen, y, 80 - margen, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', margen, y);
  doc.text(`Gs. ${Number(factura.total).toLocaleString('es-PY')}`, 80 - margen, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('¡Gracias por tu compra!', margen, y);

  return doc;
}

export function descargarFacturaPdf(factura) {
  const doc = generarPdfFactura(factura);
  doc.save(`${factura.numero_display}.pdf`);
}

export function imprimirFacturaPdf(factura) {
  const doc = generarPdfFactura(factura);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

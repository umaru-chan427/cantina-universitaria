import React, { useEffect, useState } from 'react';
import { Printer, Download, Ban } from 'lucide-react';
import { obtenerFacturas, anularFactura } from '../services/api.js';
import { descargarFacturaPdf, imprimirFacturaPdf } from '../services/facturaPdf.js';

export default function Facturacion() {
  const [datos, setDatos] = useState({ resumen: { emitidos: 0, anulados: 0, facturado: 0 }, facturas: [] });

  async function cargar() {
    const { data } = await obtenerFacturas();
    setDatos(data);
  }

  useEffect(() => { cargar(); }, []);

  async function handleAnular(id) {
    if (!confirm('¿Anular este comprobante?')) return;
    await anularFactura(id);
    cargar();
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Facturación y comprobantes</h2>
      <p className="text-sm text-gray-500 mb-6">Cada pedido confirmado genera su ticket fiscal simplificado automáticamente.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs text-gray-400 mb-1">Comprobantes emitidos</p>
          <p className="text-2xl font-black text-gray-900">{datos.resumen.emitidos}</p>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs text-gray-400 mb-1">Anulados</p>
          <p className="text-2xl font-black text-gray-900">{datos.resumen.anulados}</p>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs text-gray-400 mb-1">Facturado</p>
          <p className="text-2xl font-black text-brand-600">Gs. {Number(datos.resumen.facturado).toLocaleString('es-PY')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {datos.facturas.map((f) => (
          <div key={f.id} className="bg-white rounded-xl2 shadow-card p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{f.numero_display}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.estado === 'emitida' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {f.estado === 'emitida' ? 'Emitida' : 'Anulada'}
                </span>
                <span className="text-xs text-gray-400">Pedido {f.codigo_ticket} · {new Date(f.emitida_en).toLocaleString('es-PY')}</span>
              </div>
              <p className="text-sm text-gray-600">{f.razon_social || 'Consumidor final'} · RUC/C.I.: {f.ruc_documento || 'Sin RUC'}</p>
              <p className="text-sm font-bold text-brand-700 mt-1">Gs. {Number(f.total).toLocaleString('es-PY')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => imprimirFacturaPdf(f)} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={() => descargarFacturaPdf(f)} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <Download size={14} /> Descargar
              </button>
              {f.estado === 'emitida' && (
                <button onClick={() => handleAnular(f.id)} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition">
                  <Ban size={14} /> Anular
                </button>
              )}
            </div>
          </div>
        ))}
        {datos.facturas.length === 0 && <p className="text-center text-gray-400 py-16">Todavía no se emitió ningún comprobante.</p>}
      </div>
    </div>
  );
}

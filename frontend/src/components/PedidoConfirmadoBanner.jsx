import React, { useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { descargarFacturaPdf } from '../services/facturaPdf.js';
import { consultarSeguimiento } from '../services/api.js';

const ESTADO_LABEL = {
  pendiente: { texto: 'Pendiente', clase: 'bg-orange-100 text-orange-700' },
  en_preparacion: { texto: 'En preparación', clase: 'bg-blue-100 text-blue-700' },
  listo: { texto: 'Listo para retirar', clase: 'bg-green-100 text-green-700' },
  entregado: { texto: 'Entregado', clase: 'bg-gray-100 text-gray-600' },
};

export default function PedidoConfirmadoBanner({ pedido, onCerrar, onActualizarEstado }) {
  // Consulta el estado real cada 5 segundos mientras el pedido no esté entregado/cancelado,
  // así el alumno ve en vivo cuando la cantina lo pasa a "En preparación", "Listo", etc.
  useEffect(() => {
    if (!pedido || ['entregado', 'cancelado'].includes(pedido.estado)) return;
    const intervalo = setInterval(async () => {
      try {
        const { data } = await consultarSeguimiento(pedido.pedido_id);
        if (data.estado !== pedido.estado) onActualizarEstado(data.estado);
      } catch {
        // Si falla la consulta, simplemente reintenta en el próximo ciclo.
      }
    }, 5000);
    return () => clearInterval(intervalo);
  }, [pedido, onActualizarEstado]);

  if (!pedido) return null;
  const estado = ESTADO_LABEL[pedido.estado] || ESTADO_LABEL.pendiente;

  function handleDescargar() {
    descargarFacturaPdf({
      ...pedido.factura,
      total: pedido.total,
      metodo_pago: pedido.metodo_pago,
      items: pedido.items,
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 -mt-3 mb-2">
      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-5 py-2.5 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={18} /> ¡Pedido confirmado!
        </div>
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xl font-black text-gray-900">{pedido.codigo_ticket}</p>
            <p className="text-sm text-gray-500">
              {pedido.items.map((it) => `${it.cantidad}× ${it.nombre}`).join(' · ')}
            </p>
            <p className="text-sm text-gray-500">
              Gs. {Number(pedido.total).toLocaleString('es-PY')} · {pedido.metodo_pago}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado.clase}`}>{estado.texto}</span>
            <button onClick={handleDescargar} className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline">
              <Download size={12} /> Descargar comprobante
            </button>
          </div>
        </div>
        <button onClick={onCerrar} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 pb-3">
          Ocultar
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Trash2, Wallet, CreditCard, Plus, Minus } from 'lucide-react';
import { crearPedido } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartDrawer({ carrito, onCambiarCantidad, onQuitar, onCerrar, onPedidoCreado }) {
  const { usuario } = useAuth();
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [notas, setNotas] = useState('');
  const [facturaNombre, setFacturaNombre] = useState('');
  const [facturaRuc, setFacturaRuc] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  async function confirmarPedido() {
    setError('');
    setEnviando(true);
    try {
      const { data } = await crearPedido({
        usuario_id: usuario.id,
        metodo_pago: metodoPago,
        notas,
        factura_nombre: facturaNombre || usuario.nombre_completo,
        factura_ruc: facturaRuc,
        items: carrito.map((i) => ({ producto_id: i.id, cantidad: i.cantidad })),
      });
      onPedidoCreado(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar el pedido.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onCerrar} />
      <div className="relative bg-cream w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">Tu pedido</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>

        {carrito.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              {carrito.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-2 shadow-card">
                  <img src={item.foto_url} alt={item.nombre} className="h-14 w-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{item.nombre}</p>
                    <p className="text-xs text-gray-400">Gs. {item.precio.toLocaleString('es-PY')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-1.5 py-1">
                    <button onClick={() => onCambiarCantidad(item.id, -1)} className="text-gray-400 hover:text-brand-600"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => onCambiarCantidad(item.id, 1)} className="text-gray-400 hover:text-brand-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => onQuitar(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            <p className="text-sm font-bold text-gray-800 mb-2">Método de pago</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setMetodoPago('Efectivo')}
                className={`flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition ${metodoPago === 'Efectivo' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                <Wallet size={16} /> Efectivo en caja
              </button>
              <button
                onClick={() => setMetodoPago('Tarjeta')}
                className={`flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition ${metodoPago === 'Tarjeta' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                <CreditCard size={16} /> Tarjeta / Digital
              </button>
            </div>

            <p className="text-sm font-bold text-gray-800 mb-2">Nota para la cantina</p>
            <textarea
              value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Sin mayonesa · Retiro a las 10:15 hs"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm mb-4 bg-white"
            />

            <p className="text-sm font-bold text-gray-800 mb-2">Datos para la factura (opcional)</p>
            <div className="space-y-2 mb-5">
              <input
                value={facturaNombre} onChange={(e) => setFacturaNombre(e.target.value)}
                placeholder="Nombre o razón social"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm bg-white"
              />
              <input
                value={facturaRuc} onChange={(e) => setFacturaRuc(e.target.value)}
                placeholder="RUC / Cédula"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 outline-none text-sm bg-white"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-xl font-extrabold text-gray-900">Gs. {total.toLocaleString('es-PY')}</span>
            </div>

            {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

            <button
              onClick={confirmarPedido}
              disabled={enviando}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {enviando ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

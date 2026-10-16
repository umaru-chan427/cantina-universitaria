import React, { useEffect, useState } from 'react';
import { obtenerTablero, cambiarEstadoPedido } from '../services/api.js';

const COLUMNAS = [
  { key: 'pendiente', titulo: 'Pendiente', siguiente: 'en_preparacion', accion: 'Comenzar preparación', color: 'text-orange-600 bg-orange-100' },
  { key: 'en_preparacion', titulo: 'En preparación', siguiente: 'listo', accion: 'Marcar listo', color: 'text-blue-600 bg-blue-100' },
  { key: 'listo', titulo: 'Listo para entregar', siguiente: 'entregado', accion: 'Marcar entregado', color: 'text-green-600 bg-green-100' },
  { key: 'entregado', titulo: 'Entregado', siguiente: null, accion: null, color: 'text-gray-500 bg-gray-100' },
];

export default function PedidosKanban() {
  const [tablero, setTablero] = useState({ pendiente: [], en_preparacion: [], listo: [], entregado: [] });

  async function cargar() {
    const { data } = await obtenerTablero();
    setTablero(data);
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 15000); // refresco automático
    return () => clearInterval(intervalo);
  }, []);

  async function avanzar(pedido, siguiente) {
    await cambiarEstadoPedido(pedido.id, siguiente);
    cargar();
  }

  async function reabrir(pedido) {
    await cambiarEstadoPedido(pedido.id, 'listo');
    cargar();
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Pedidos en tiempo real</h2>
      <p className="text-sm text-gray-500 mb-6">Movés el pedido de columna a medida que avanza la preparación.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNAS.map((col) => (
          <div key={col.key} className="bg-white rounded-xl2 shadow-card p-4 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{col.titulo}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${col.color}`}>{tablero[col.key]?.length || 0}</span>
            </div>

            {(!tablero[col.key] || tablero[col.key].length === 0) && (
              <div className="border-2 border-dashed border-gray-100 rounded-xl text-center text-xs text-gray-300 py-8">
                Sin pedidos aquí
              </div>
            )}

            <div className="space-y-3">
              {tablero[col.key]?.map((p) => (
                <div key={p.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-900">{p.codigo_ticket}</p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(p.creado_en).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{p.nombre_completo}</p>
                  <div className="text-sm text-gray-700 mb-2">
                    {p.items.map((it, idx) => <div key={idx}>{it}</div>)}
                  </div>
                  {p.notas && <p className="text-xs italic text-gray-400 bg-white rounded-lg px-2 py-1 mb-2">"{p.notas}"</p>}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="bg-white px-2 py-1 rounded-full font-medium text-gray-600">{p.metodo_pago}</span>
                    <span className="font-bold text-brand-700">Gs. {Number(p.total).toLocaleString('es-PY')}</span>
                  </div>

                  {col.siguiente && (
                    <button
                      onClick={() => avanzar(p, col.siguiente)}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-sm py-2 rounded-full transition"
                    >
                      {col.accion}
                    </button>
                  )}
                  {col.key === 'entregado' && (
                    <button onClick={() => reabrir(p)} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
                      Reabrir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

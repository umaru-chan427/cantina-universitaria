import React, { useEffect, useState } from 'react';
import { Lock, CreditCard, Wallet, TrendingDown } from 'lucide-react';
import { abrirCaja, cerrarCaja, estadoCaja, registrarEgreso } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CajaDiaria() {
  const { usuario } = useAuth();
  const [caja, setCaja] = useState(null);
  const [montoApertura, setMontoApertura] = useState('');
  const [efectivoContado, setEfectivoContado] = useState('');
  const [conceptoEgreso, setConceptoEgreso] = useState('');
  const [montoEgreso, setMontoEgreso] = useState('');
  const [resumenCierre, setResumenCierre] = useState(null);

  async function cargar() {
    const { data } = await estadoCaja();
    setCaja(data);
  }

  useEffect(() => { cargar(); }, []);

  async function handleAbrir() {
    await abrirCaja({ usuario_id: usuario.id, monto_apertura: montoApertura || 0 });
    setMontoApertura('');
    cargar();
  }

  async function handleEgreso() {
    if (!conceptoEgreso || !montoEgreso) return;
    await registrarEgreso({ caja_id: caja.id, concepto: conceptoEgreso, monto: montoEgreso });
    setConceptoEgreso(''); setMontoEgreso('');
    cargar();
  }

  async function handleCerrar() {
    const { data } = await cerrarCaja({ caja_id: caja.id, efectivo_contado: efectivoContado || 0 });
    setResumenCierre(data);
    setCaja(null);
  }

  if (!caja && !resumenCierre) {
    return (
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Caja diaria</h2>
        <div className="bg-white rounded-xl2 shadow-card p-6 max-w-md">
          <p className="text-gray-500 text-sm mb-4">No hay una caja abierta actualmente.</p>
          <input
            type="number" placeholder="Monto de apertura (Gs.)" value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 mb-4"
          />
          <button onClick={handleAbrir} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition">
            Abrir caja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-extrabold text-gray-900">Caja diaria</h2>
        {caja && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">Abierta</span>}
      </div>
      {caja && (
        <p className="text-sm text-gray-500 mb-6">
          Caja abierta desde las {new Date(caja.abierta_en).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })} con Gs. {Number(caja.monto_apertura).toLocaleString('es-PY')}.
        </p>
      )}

      {caja && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Lock size={14} /> Monto inicial</div>
              <p className="text-lg font-extrabold text-gray-900">Gs. {Number(caja.monto_apertura).toLocaleString('es-PY')}</p>
            </div>
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Wallet size={14} /> Efectivo cobrado</div>
              <p className="text-lg font-extrabold text-gray-900">Gs. {Number(caja.total_efectivo).toLocaleString('es-PY')}</p>
            </div>
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><CreditCard size={14} /> Tarjeta / App</div>
              <p className="text-lg font-extrabold text-gray-900">Gs. {Number(caja.total_tarjeta).toLocaleString('es-PY')}</p>
            </div>
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><TrendingDown size={14} /> Egresos y pagos</div>
              <p className="text-lg font-extrabold text-gray-900">Gs. {Number(caja.total_egresos).toLocaleString('es-PY')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl2 shadow-card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Cierre y arqueo</h3>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Ventas del día</span><span className="font-medium">Gs. {(caja.total_efectivo + caja.total_tarjeta).toLocaleString('es-PY')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Egresos y sueldos</span><span className="font-medium">- Gs. {Number(caja.total_egresos).toLocaleString('es-PY')}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-100 pt-2"><span>Efectivo esperado</span><span className="text-brand-600">Gs. {Number(caja.efectivo_esperado).toLocaleString('es-PY')}</span></div>
              </div>
              <label className="text-sm text-gray-600">Efectivo contado (Gs.)</label>
              <input
                type="number" value={efectivoContado} onChange={(e) => setEfectivoContado(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 mb-4 mt-1"
              />
              <button onClick={handleCerrar} className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 rounded-xl transition">
                <Lock size={16} /> Cerrar caja y hacer arqueo
              </button>
            </div>

            <div className="bg-white rounded-xl2 shadow-card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Egresos y gastos menores</h3>
              <div className="flex gap-2 mb-4">
                <input
                  placeholder="Ej: Compra de servilletas" value={conceptoEgreso}
                  onChange={(e) => setConceptoEgreso(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200"
                />
                <input
                  type="number" placeholder="Monto" value={montoEgreso} onChange={(e) => setMontoEgreso(e.target.value)}
                  className="w-28 px-4 py-2.5 rounded-xl border border-gray-200"
                />
                <button onClick={handleEgreso} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 rounded-xl transition">
                  Registrar
                </button>
              </div>
              <div className="space-y-2">
                {caja.egresos?.length === 0 && (
                  <p className="text-center text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-xl py-6">Sin egresos registrados hoy</p>
                )}
                {caja.egresos?.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-600">{e.concepto}</span>
                    <span className="font-semibold text-gray-800">Gs. {Number(e.monto).toLocaleString('es-PY')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {resumenCierre && (
        <div className="bg-white rounded-xl2 shadow-card p-6 max-w-md mt-6">
          <h3 className="font-bold text-gray-900 mb-4">Resumen del arqueo</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Apertura</span><span>Gs. {resumenCierre.monto_apertura.toLocaleString('es-PY')}</span></div>
            <div className="flex justify-between"><span>Efectivo</span><span>Gs. {resumenCierre.total_efectivo.toLocaleString('es-PY')}</span></div>
            <div className="flex justify-between"><span>Tarjeta</span><span>Gs. {resumenCierre.total_tarjeta.toLocaleString('es-PY')}</span></div>
            <div className="flex justify-between"><span>Egresos</span><span>- Gs. {resumenCierre.total_egresos.toLocaleString('es-PY')}</span></div>
            <div className="flex justify-between font-bold border-t border-gray-100 pt-2"><span>Efectivo esperado</span><span>Gs. {resumenCierre.efectivo_esperado.toLocaleString('es-PY')}</span></div>
            <div className="flex justify-between font-bold"><span>Efectivo contado</span><span>Gs. {resumenCierre.efectivo_contado.toLocaleString('es-PY')}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

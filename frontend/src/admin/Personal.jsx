import React, { useEffect, useState } from 'react';
import { ArrowRightCircle, ArrowLeftCircle, Trash2, UserPlus, Wallet2 } from 'lucide-react';
import {
  obtenerEmpleados, crearEmpleado, eliminarEmpleado, marcarEntrada, marcarSalida,
  obtenerPagos, registrarPago,
} from '../services/api.js';

export default function Personal() {
  const [empleados, setEmpleados] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [form, setForm] = useState({ nombre_completo: '', rol: '', telefono: '', turno: '' });
  const [pagoForm, setPagoForm] = useState({ empleado_id: '', monto: '', tipo: 'adelanto' });

  async function cargar() {
    const [resEmp, resPagos] = await Promise.all([obtenerEmpleados(), obtenerPagos()]);
    setEmpleados(resEmp.data);
    setPagos(resPagos.data);
    if (!pagoForm.empleado_id && resEmp.data[0]) {
      setPagoForm((f) => ({ ...f, empleado_id: resEmp.data[0].id }));
    }
  }

  useEffect(() => { cargar(); }, []);

  async function handleAgregar(e) {
    e.preventDefault();
    await crearEmpleado(form);
    setForm({ nombre_completo: '', rol: '', telefono: '', turno: '' });
    cargar();
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este integrante del equipo?')) return;
    await eliminarEmpleado(id);
    cargar();
  }

  async function handleEntrada(id) { await marcarEntrada(id); cargar(); }
  async function handleSalida(id) { await marcarSalida(id); cargar(); }

  async function handlePago(e) {
    e.preventDefault();
    if (!pagoForm.empleado_id || !pagoForm.monto) return;
    await registrarPago(pagoForm);
    setPagoForm((f) => ({ ...f, monto: '' }));
    cargar();
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">Personal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {empleados.map((emp) => {
          const enTurno = emp.entrada_hoy && !emp.salida_hoy;
          return (
            <div key={emp.id} className="bg-white rounded-xl2 shadow-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900">{emp.nombre_completo}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${enTurno ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {enTurno ? 'En turno' : 'Fuera de turno'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{emp.rol}{emp.turno ? ` · Turno ${emp.turno}` : ''}</p>
              {emp.telefono && <p className="text-sm text-pink-500">📞 {emp.telefono}</p>}
              {emp.entrada_hoy && (
                <p className="text-xs text-gray-400 mt-1">
                  Entrada {new Date(emp.entrada_hoy).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
                  {emp.salida_hoy && ` · Salida ${new Date(emp.salida_hoy).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  disabled={!!emp.entrada_hoy}
                  onClick={() => handleEntrada(emp.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 transition"
                >
                  <ArrowRightCircle size={14} /> Marcar entrada
                </button>
                <button
                  disabled={!emp.entrada_hoy || !!emp.salida_hoy}
                  onClick={() => handleSalida(emp.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-40 transition"
                >
                  <ArrowLeftCircle size={14} /> Marcar salida
                </button>
                <button onClick={() => handleEliminar(emp.id)} className="ml-auto text-gray-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleAgregar} className="bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserPlus size={18} /> Nuevo integrante</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500">Nombre</label>
              <input required value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1" placeholder="Rosa Benítez" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rol</label>
              <input required value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1" placeholder="Cajera" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1" placeholder="0981 445 220" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Turno</label>
              <input value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1" placeholder="07:00 - 13:00" />
            </div>
          </div>
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition">Agregar al equipo</button>
        </form>

        <div className="bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Wallet2 size={18} /> Sueldos y adelantos</h3>
          <form onSubmit={handlePago} className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500">Empleado</label>
              <select value={pagoForm.empleado_id} onChange={(e) => setPagoForm({ ...pagoForm, empleado_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1">
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Monto (Gs.)</label>
              <input type="number" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 mt-1" placeholder="150000" />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPagoForm({ ...pagoForm, tipo: 'adelanto' })}
                className={`py-2.5 rounded-full text-sm font-semibold transition ${pagoForm.tipo === 'adelanto' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                Adelanto
              </button>
              <button type="button" onClick={() => setPagoForm({ ...pagoForm, tipo: 'sueldo' })}
                className={`py-2.5 rounded-full text-sm font-semibold transition ${pagoForm.tipo === 'sueldo' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                Sueldo
              </button>
            </div>
            <button className="col-span-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition">Registrar pago</button>
          </form>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pagos.length === 0 && <p className="text-center text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-xl py-6">Sin pagos registrados</p>}
            {pagos.map((p) => (
              <div key={p.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">{p.nombre_completo} · {p.tipo}</span>
                <span className="font-semibold text-gray-800">Gs. {Number(p.monto).toLocaleString('es-PY')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Plus, Minus, Pencil, Trash2, Ban, RotateCcw, PackagePlus } from 'lucide-react';
import {
  obtenerProductos, obtenerCategorias, crearProducto, actualizarProducto,
  ajustarStock, alternarHabilitado, eliminarProducto,
  obtenerInsumos, crearInsumo, ajustarInsumo, eliminarInsumo,
} from '../services/api.js';
import ModalProducto from './ModalProducto.jsx';

const ESTADO_INSUMO_CLASE = {
  'En orden': 'bg-green-100 text-green-700',
  'Stock crítico': 'bg-orange-100 text-orange-700',
  'Por vencer': 'bg-orange-100 text-orange-700',
};

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const [insumos, setInsumos] = useState([]);
  const [nuevoInsumo, setNuevoInsumo] = useState({ nombre: '', unidad: '', cantidad: '', minimo: '', vencimiento: '' });

  async function cargarProductos() {
    const [resProd, resCat] = await Promise.all([obtenerProductos(), obtenerCategorias()]);
    setProductos(resProd.data);
    setCategorias(resCat.data);
  }
  async function cargarInsumos() {
    const { data } = await obtenerInsumos();
    setInsumos(data);
  }

  useEffect(() => { cargarProductos(); cargarInsumos(); }, []);

  async function handleGuardar(form) {
    if (form.id) await actualizarProducto(form); else await crearProducto(form);
    setModalAbierto(false); setProductoEditar(null);
    cargarProductos();
  }
  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    await eliminarProducto(id); cargarProductos();
  }
  async function handleStock(id, delta) { await ajustarStock(id, delta); cargarProductos(); }
  async function handleHabilitar(id) { await alternarHabilitado(id); cargarProductos(); }

  async function handleAgregarInsumo(e) {
    e.preventDefault();
    if (!nuevoInsumo.nombre || !nuevoInsumo.unidad) return;
    await crearInsumo(nuevoInsumo);
    setNuevoInsumo({ nombre: '', unidad: '', cantidad: '', minimo: '', vencimiento: '' });
    cargarInsumos();
  }
  async function handleInsumoDelta(id, delta) { await ajustarInsumo(id, delta); cargarInsumos(); }
  async function handleEliminarInsumo(id) { await eliminarInsumo(id); cargarInsumos(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Productos del menú</h2>
          <p className="text-sm text-gray-500">Cargá, editá o eliminá productos y ajustá el stock con un clic.</p>
        </div>
        <button onClick={() => { setProductoEditar(null); setModalAbierto(true); }}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl transition">
          <PackagePlus size={18} /> Agregar producto
        </button>
      </div>

      <div className="bg-white rounded-xl2 shadow-card overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr><th className="p-4">Producto</th><th className="p-4">Categoría</th><th className="p-4">Precio</th><th className="p-4">Stock</th><th className="p-4 text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.foto_url} alt={p.nombre} className="h-10 w-10 object-cover rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900">{p.nombre}</p>
                    {!p.habilitado && <span className="text-[10px] text-red-500 font-semibold">Deshabilitado</span>}
                  </div>
                </td>
                <td className="p-4 text-gray-500">{p.categoria}</td>
                <td className="p-4 text-gray-700">Gs. {Number(p.precio).toLocaleString('es-PY')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleStock(p.id, -1)} className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus size={14} /></button>
                    <span className="w-6 text-center font-semibold">{p.stock}</span>
                    <button onClick={() => handleStock(p.id, 1)} className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                </td>
                <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                  <button onClick={() => handleHabilitar(p.id)} title={p.habilitado ? 'Deshabilitar' : 'Habilitar'}
                    className={`h-8 w-8 rounded-full inline-flex items-center justify-center transition ${p.habilitado ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                    {p.habilitado ? <Ban size={15} /> : <RotateCcw size={15} />}
                  </button>
                  <button onClick={() => { setProductoEditar(p); setModalAbierto(true); }} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                    <Pencil size={14} /> Editar
                  </button>
                  <button onClick={() => handleEliminar(p.id)} className="text-gray-300 hover:text-red-500 align-middle"><Trash2 size={18} className="inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Insumos y materia prima</h2>
      <p className="text-sm text-gray-500 mb-4">Harina, leche, fetas de jamón y todo lo que se usa para cocinar.</p>

      <form onSubmit={handleAgregarInsumo} className="bg-white rounded-xl2 shadow-card p-5 grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <input placeholder="Insumo" value={nuevoInsumo.nombre} onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, nombre: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200 col-span-2 md:col-span-1" />
        <input placeholder="Unidad (kg, L...)" value={nuevoInsumo.unidad} onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, unidad: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200" />
        <input type="number" placeholder="Cantidad" value={nuevoInsumo.cantidad} onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, cantidad: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200" />
        <input type="number" placeholder="Mínimo" value={nuevoInsumo.minimo} onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, minimo: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200" />
        <input type="date" value={nuevoInsumo.vencimiento} onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, vencimiento: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200" />
        <button className="col-span-2 md:col-span-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition">Agregar insumo</button>
      </form>

      <div className="bg-white rounded-xl2 shadow-card divide-y divide-gray-100">
        {insumos.map((i) => (
          <div key={i.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{i.nombre}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_INSUMO_CLASE[i.estado]}`}>{i.estado}</span>
              </div>
              <p className="text-xs text-gray-400">
                {i.cantidad} {i.unidad} · mínimo {i.minimo} {i.unidad}{i.vencimiento ? ` · vence ${i.vencimiento}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => handleInsumoDelta(i.id, -1)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus size={14} /></button>
              <button onClick={() => handleInsumoDelta(i.id, 1)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus size={14} /></button>
              <button onClick={() => handleEliminarInsumo(i.id)} className="text-gray-300 hover:text-red-500 ml-1"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {insumos.length === 0 && <p className="text-center text-gray-400 py-10">Sin insumos cargados.</p>}
      </div>

      {modalAbierto && (
        <ModalProducto producto={productoEditar} categorias={categorias} onGuardar={handleGuardar} onCerrar={() => setModalAbierto(false)} />
      )}
    </div>
  );
}

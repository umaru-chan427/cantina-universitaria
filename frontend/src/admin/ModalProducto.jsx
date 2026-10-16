import React, { useState } from 'react';
import { X } from 'lucide-react';
import { resolverFoto } from '../config/images.js';

export default function ModalProducto({ producto, categorias, onGuardar, onCerrar }) {
  const [form, setForm] = useState(
    producto || { categoria_id: categorias[0]?.id || '', nombre: '', descripcion: '', precio: '', foto_url: '', stock: 0 }
  );
  const categoriaSel = categorias.find((c) => c.id === Number(form.categoria_id));
  const preview = resolverFoto(form.foto_url, categoriaSel?.slug);

  function actualizar(campo, valor) { setForm((f) => ({ ...f, [campo]: valor })); }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl2 shadow-card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg text-gray-900">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onCerrar}><X size={20} className="text-gray-400" /></button>
        </div>
        <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-xl mb-4" />
        <div className="space-y-3">
          <select value={form.categoria_id} onChange={(e) => actualizar('categoria_id', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200">
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input placeholder="Nombre del producto" value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
          <input placeholder="Descripción" value={form.descripcion || ''} onChange={(e) => actualizar('descripcion', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
          <input placeholder="URL de foto real (opcional)" value={form.foto_url || ''} onChange={(e) => actualizar('foto_url', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Precio (Gs.)" value={form.precio} onChange={(e) => actualizar('precio', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => actualizar('stock', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
          </div>
        </div>
        <button onClick={() => onGuardar(form)} className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
          Guardar producto
        </button>
      </div>
    </div>
  );
}

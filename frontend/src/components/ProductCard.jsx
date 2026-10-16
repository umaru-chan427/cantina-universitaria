import React from 'react';
import { Plus } from 'lucide-react';

const COLOR_CLASSES = {
  verde: 'bg-green-100 text-green-700',
  naranja: 'bg-orange-100 text-orange-700',
  rojo: 'bg-red-100 text-red-600',
};

export default function ProductCard({ producto, onAgregar }) {
  const agotado = producto.estado_stock.color === 'rojo';

  return (
    <div className="bg-white rounded-xl2 shadow-card hover:shadow-card-hover transition overflow-hidden flex flex-col">
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={producto.foto_url}
          alt={producto.nombre}
          className={`h-full w-full object-cover ${agotado ? 'grayscale opacity-70' : ''}`}
          loading="lazy"
        />
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2.5 py-1 rounded-full ${COLOR_CLASSES[producto.estado_stock.color]}`}>
          {producto.estado_stock.texto}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{producto.descripcion}</p>}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-extrabold text-brand-700 text-sm">Gs. {Number(producto.precio).toLocaleString('es-PY')}</span>
          <button
            disabled={agotado}
            onClick={() => onAgregar(producto)}
            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

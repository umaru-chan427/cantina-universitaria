import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function CategoriaCard({ categoria, activa, onClick }) {
  if (categoria === 'todas') {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl2 border-2 transition shrink-0 w-28 ${
          activa ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white'
        }`}
      >
        <UtensilsCrossed className="text-brand-600" size={22} />
        <span className="text-xs font-semibold text-gray-700">Todo el menú</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-28 h-28 rounded-xl2 overflow-hidden border-2 transition ${
        activa ? 'border-brand-500' : 'border-transparent'
      }`}
    >
      <img src={categoria.foto_url} alt={categoria.nombre} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold text-left leading-tight">
        {categoria.nombre}
      </span>
    </button>
  );
}

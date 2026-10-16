import React, { useEffect, useMemo, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { obtenerCategorias, obtenerProductos } from '../services/api.js';
import ProductCard from './ProductCard.jsx';

export default function Catalogo({ busqueda, onAgregarAlCarrito }) {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [resCat, resProd] = await Promise.all([obtenerCategorias(), obtenerProductos()]);
        setCategorias(resCat.data);
        setProductos(resProd.data);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const productosFiltrados = useMemo(() => {
    let lista = productos;
    if (categoriaActiva !== 'todas') lista = lista.filter((p) => p.categoria === categoriaActiva);
    if (busqueda?.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    return lista;
  }, [productos, categoriaActiva, busqueda]);

  if (cargando) return <div className="text-center py-20 text-gray-400">Cargando el menú de hoy...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-lg font-extrabold text-gray-900 mb-3">Categorías</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <button
          onClick={() => setCategoriaActiva('todas')}
          className={`bg-white rounded-xl2 shadow-card hover:shadow-card-hover transition p-4 flex flex-col items-center gap-2 ${categoriaActiva === 'todas' ? 'ring-2 ring-brand-500' : ''}`}
        >
          <UtensilsCrossed className="text-brand-600" size={26} />
          <span className="text-sm font-semibold text-gray-700">Todo el menú</span>
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoriaActiva(c.nombre)}
            className={`bg-white rounded-xl2 shadow-card hover:shadow-card-hover transition overflow-hidden flex flex-col items-center ${categoriaActiva === c.nombre ? 'ring-2 ring-brand-500' : ''}`}
          >
            <img src={c.foto_url} alt={c.nombre} className="h-16 w-full object-cover" />
            <span className="text-sm font-semibold text-gray-700 py-2">{c.nombre}</span>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-extrabold text-gray-900 mb-3">Menú de hoy</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {productosFiltrados.map((p) => (
          <ProductCard key={p.id} producto={p} onAgregar={onAgregarAlCarrito} />
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <p className="text-center text-gray-400 py-16">No encontramos productos con ese criterio.</p>
      )}
    </div>
  );
}

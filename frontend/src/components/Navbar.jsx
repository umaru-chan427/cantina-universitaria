import React from 'react';
import { ShoppingBag, LogOut, UtensilsCrossed, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ vista, onCambiarVista, cantidadCarrito, onAbrirCarrito, busqueda, onBuscar, titulo }) {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-brand-500 to-brand-600 pb-6 rounded-b-3xl shadow-md">
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 text-white p-2.5 rounded-2xl">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-white/80 uppercase">La Cafetería Provending</p>
              <h1 className="text-lg font-extrabold text-white leading-tight">
                {titulo || (usuario ? `¡Hola, ${usuario.nombre_completo.split(' ')[0]}! 👋` : 'Panel de cantina')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCambiarVista && (
              <div className="flex bg-white/20 rounded-full p-1 text-sm font-semibold">
                <button
                  onClick={() => onCambiarVista('alumno')}
                  className={`px-3 py-1.5 rounded-full transition ${vista === 'alumno' ? 'bg-white text-brand-600' : 'text-white'}`}
                >
                  Alumno
                </button>
                <button
                  onClick={() => onCambiarVista('cantina')}
                  className={`px-3 py-1.5 rounded-full transition ${vista === 'cantina' ? 'bg-white text-brand-600' : 'text-white'}`}
                >
                  Cantina
                </button>
              </div>
            )}
            <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition">
              <LogOut size={18} />
            </button>
            {vista === 'alumno' && onAbrirCarrito && (
              <button onClick={onAbrirCarrito} className="relative bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition">
                <ShoppingBag size={20} />
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-brand-600 text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cantidadCarrito}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {onBuscar && (
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              value={busqueda}
              onChange={(e) => onBuscar(e.target.value)}
              placeholder="Buscar empanadas, jugos, tostados..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-white/50 outline-none"
            />
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { obtenerInsumos } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PedidosKanban from './PedidosKanban.jsx';
import CajaDiaria from './CajaDiaria.jsx';
import Facturacion from './Facturacion.jsx';
import Personal from './Personal.jsx';
import Inventario from './Inventario.jsx';

const TABS = [
  { id: 'pedidos', label: 'Pedidos', roles: ['cantina', 'admin'] },
  { id: 'caja', label: 'Caja diaria', roles: ['cantina', 'admin'] },
  { id: 'inventario', label: 'Inventario', roles: ['cantina', 'admin'] },
  { id: 'facturacion', label: 'Facturación', roles: ['admin'] },
  { id: 'personal', label: 'Personal', roles: ['admin'] },
];

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const tabsVisibles = TABS.filter((t) => t.roles.includes(usuario?.rol));
  const [tab, setTab] = useState(tabsVisibles[0]?.id || 'pedidos');
  const [alertasInsumos, setAlertasInsumos] = useState(0);

  useEffect(() => {
    obtenerInsumos().then(({ data }) => {
      setAlertasInsumos(data.filter((i) => i.estado !== 'En orden').length);
    }).catch(() => {});
  }, [tab]);

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-4">
      <div className="bg-white rounded-full shadow-card p-1.5 flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabsVisibles.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 ${tab === t.id ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {t.label}
            {t.id === 'inventario' && alertasInsumos > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/25' : 'bg-orange-100 text-orange-600'}`}>
                {alertasInsumos}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pb-16">
        {tab === 'pedidos' && <PedidosKanban />}
        {tab === 'caja' && <CajaDiaria />}
        {tab === 'facturacion' && tabsVisibles.some((t) => t.id === 'facturacion') && <Facturacion />}
        {tab === 'personal' && tabsVisibles.some((t) => t.id === 'personal') && <Personal />}
        {tab === 'inventario' && <Inventario />}
      </div>
    </div>
  );
}

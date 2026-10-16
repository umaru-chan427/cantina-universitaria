import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';

import AccesoAlumno from './components/AccesoAlumno.jsx';
import RecuperarPassword from './components/RecuperarPassword.jsx';
import RestablecerPassword from './components/RestablecerPassword.jsx';
import Navbar from './components/Navbar.jsx';
import Catalogo from './components/Catalogo.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import PedidoConfirmadoBanner from './components/PedidoConfirmadoBanner.jsx';

import AccesoCantina from './admin/AccesoCantina.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';

export default function App() {
  const { usuario } = useAuth();
  const [mostrarAccesoCantina, setMostrarAccesoCantina] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [tokenReset, setTokenReset] = useState(() => new URLSearchParams(window.location.search).get('reset'));
  const [vista, setVista] = useState('alumno'); // alumno | cantina
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  function limpiarTokenDeUrl() {
    setTokenReset(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('reset');
    window.history.replaceState({}, '', url.toString());
  }

  // --- Sin sesión iniciada ---
  if (!usuario) {
    if (tokenReset) {
      return <RestablecerPassword token={tokenReset} onListo={limpiarTokenDeUrl} />;
    }
    if (mostrarRecuperar) {
      return <RecuperarPassword onVolver={() => setMostrarRecuperar(false)} />;
    }
    return mostrarAccesoCantina
      ? <AccesoCantina onVolver={() => setMostrarAccesoCantina(false)} />
      : <AccesoAlumno
          onAccederComoCantina={() => setMostrarAccesoCantina(true)}
          onOlvidoPassword={() => setMostrarRecuperar(true)}
        />;
  }

  // --- Sesión de personal/admin: puede ver el panel de cantina o el catálogo como demo ---
  const esPersonal = ['admin', 'cantina'].includes(usuario.rol);

  function cambiarVista(nueva) {
    if (nueva === 'cantina' && !esPersonal) {
      setMostrarAccesoCantina(true);
      return;
    }
    setVista(nueva);
  }

  if (mostrarAccesoCantina && !esPersonal) {
    return <AccesoCantina onVolver={() => setMostrarAccesoCantina(false)} />;
  }

  function agregarAlCarrito(producto) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id === producto.id);
      if (existente) return prev.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setCarritoAbierto(true);
  }
  function cambiarCantidad(id, delta) {
    setCarrito((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)));
  }
  function quitarDelCarrito(id) { setCarrito((prev) => prev.filter((i) => i.id !== id)); }
  function handlePedidoCreado(data) {
    setPedidoConfirmado(data);
    setCarrito([]);
    setCarritoAbierto(false);
  }

  const vistaActual = esPersonal ? vista : 'alumno';

  return (
    <div className="min-h-screen bg-cream">
      <Navbar
        vista={vistaActual}
        onCambiarVista={esPersonal ? cambiarVista : undefined}
        cantidadCarrito={carrito.reduce((a, i) => a + i.cantidad, 0)}
        onAbrirCarrito={() => setCarritoAbierto(true)}
        busqueda={vistaActual === 'alumno' ? busqueda : undefined}
        onBuscar={vistaActual === 'alumno' ? setBusqueda : undefined}
        titulo={vistaActual === 'cantina' ? 'Panel de cantina' : undefined}
      />

      {vistaActual === 'alumno' ? (
        <>
          <PedidoConfirmadoBanner
            pedido={pedidoConfirmado}
            onCerrar={() => setPedidoConfirmado(null)}
            onActualizarEstado={(nuevoEstado) => setPedidoConfirmado((p) => (p ? { ...p, estado: nuevoEstado } : p))}
          />
          <Catalogo busqueda={busqueda} onAgregarAlCarrito={agregarAlCarrito} />
          {carritoAbierto && (
            <CartDrawer
              carrito={carrito}
              onCambiarCantidad={cambiarCantidad}
              onQuitar={quitarDelCarrito}
              onCerrar={() => setCarritoAbierto(false)}
              onPedidoCreado={handlePedidoCreado}
            />
          )}
        </>
      ) : (
        <div className="mt-6">
          <AdminDashboard />
        </div>
      )}
    </div>
  );
}

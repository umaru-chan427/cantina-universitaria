import React, { useState } from 'react';
import { Mail, Lock, User, UtensilsCrossed, ChefHat } from 'lucide-react';
import { loginUsuario, registrarUsuario } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccesoAlumno({ onAccederComoCantina, onOlvidoPassword }) {
  const [tab, setTab] = useState('login'); // login | registro
  const [nombre, setNombre] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres.'); return; }
    setCargando(true);
    try {
      const { data } = await loginUsuario({ identificador, password });
      login(data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    setError('');
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres.'); return; }
    setCargando(true);
    try {
      await registrarUsuario({ nombre_completo: nombre, email: identificador, password });
      const { data } = await loginUsuario({ identificador, password });
      login(data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Panel izquierdo con foto real de empanada */}
      <div
        className="hidden md:flex w-1/2 relative items-end p-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(18,115,194,0.6), rgba(30,143,221,0.35)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200')",
        }}
      >
        <div className="text-white">
          <h2 className="text-3xl font-extrabold mb-2">¡Tu cafetería de siempre! ☕</h2>
          <p className="text-white/90 max-w-sm">
            Empanadas, minutas, bebidas y cafetería. Pedí desde el celu y retirá sin hacer fila.
          </p>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-600 text-white p-2.5 rounded-2xl">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase">La Cafetería Provending</p>
            <h1 className="text-xl font-extrabold text-gray-900">
              {tab === 'login' ? 'Ingresá a tu cuenta' : 'Registrate como alumno'}
            </h1>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-full p-1 mb-6 max-w-sm">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${tab === 'login' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setTab('registro')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${tab === 'registro' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleRegistro} className="space-y-4 max-w-sm bg-white rounded-xl2 shadow-card p-6">
          {tab === 'registro' && (
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre y apellido</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="Natalia Peralta"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Correo institucional</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email" required value={identificador} onChange={(e) => setIdentificador(e.target.value)}
                placeholder="alumno@uni.edu.py"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
            {password && password.length < 4 && (
              <p className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 4 caracteres.</p>
            )}
          </div>

          {tab === 'login' && (
            <div className="text-right -mt-2">
              <button type="button" onClick={onOlvidoPassword} className="text-xs text-brand-600 font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit" disabled={cargando}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition disabled:opacity-60"
          >
            {cargando ? 'Un momento...' : tab === 'login' ? 'Entrar' : 'Crear mi cuenta'}
          </button>
        </form>

        <div className="max-w-sm">
          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">o</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            onClick={onAccederComoCantina}
            className="w-full flex items-center justify-center gap-2 border border-brand-200 text-brand-600 hover:bg-brand-50 font-semibold py-3 rounded-xl transition"
          >
            <ChefHat size={18} /> Acceso personal de cantina
          </button>

        </div>
      </div>
    </div>
  );
}

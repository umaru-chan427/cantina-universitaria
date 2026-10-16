import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { loginUsuario } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccesoCantina({ onVolver }) {
  const [identificador, setIdentificador] = useState('admin@provending.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginUsuario({ identificador, password });
      if (!['admin', 'cantina'].includes(data.usuario.rol)) {
        setError('Esta cuenta no tiene acceso al panel de cantina.');
        return;
      }
      login(data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-card p-8">
        <button onClick={onVolver} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gray-900 text-white p-3 rounded-2xl mb-3"><ShieldCheck size={28} /></div>
          <h1 className="text-xl font-extrabold text-gray-900">Panel de cantina</h1>
          <p className="text-sm text-gray-400">Acceso exclusivo para personal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={identificador} onChange={(e) => setIdentificador(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="admin@provending.com"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="Contraseña"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition">
            Ingresar al panel
          </button>
        </form>
      </div>
    </div>
  );
}

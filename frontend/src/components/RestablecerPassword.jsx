import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { restablecerPassword } from '../services/api.js';

export default function RestablecerPassword({ token, onListo }) {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres.'); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return; }

    setCargando(true);
    try {
      await restablecerPassword({ token, password });
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 text-white p-3 rounded-2xl mb-3">
            <Lock size={26} />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Crear nueva contraseña</h1>
        </div>

        {exito ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={48} />
            <p className="text-green-600 text-sm font-medium">¡Contraseña actualizada correctamente!</p>
            <button onClick={onListo} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit" disabled={cargando}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

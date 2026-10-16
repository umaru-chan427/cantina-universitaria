import React, { useState } from 'react';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { solicitarRecuperacion } from '../services/api.js';

export default function RecuperarPassword({ onVolver }) {
  const [identificador, setIdentificador] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enlaceDev, setEnlaceDev] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await solicitarRecuperacion({ identificador });
      setEnviado(true);
      if (data.modo_desarrollo) setEnlaceDev(data.enlace_recuperacion);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 text-white p-3 rounded-2xl mb-3">
            <KeyRound size={26} />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Recuperar contraseña</h1>
          <p className="text-sm text-gray-400 text-center">Te enviamos un enlace para crear una nueva</p>
        </div>

        {enviado ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 text-sm font-medium">
              Si el dato está registrado, vas a recibir un correo con instrucciones en unos minutos.
            </p>

            {enlaceDev && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-brand-700 mb-2">
                  Modo desarrollo: tu servidor de correo no está configurado, así que te dejamos el enlace acá para que puedas probarlo:
                </p>
                <a href={enlaceDev} className="text-xs text-brand-600 underline break-all">{enlaceDev}</a>
              </div>
            )}

            <button onClick={onVolver} className="text-brand-600 font-semibold hover:underline text-sm">
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                required value={identificador} onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Tu correo o teléfono registrado"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit" disabled={cargando}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <button type="button" onClick={onVolver} className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm font-medium py-2">
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Por si cambias a querystring
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    try {
      // Caso actual: token en el hash: #token=JWT
      const hash = window.location.hash;         // "#token=...."
      const fromHash = new URLSearchParams(hash.slice(1)).get('token');

      // (Opcional) soporte si algún día lo cambias a querystring ?token=...
      const fromQuery = searchParams.get('token');

      const token = fromHash || fromQuery;
      if (!token) throw new Error('No se recibió token');

      // Guarda y redirige
      localStorage.setItem('auth_token', token);
      setState({ loading: false, error: '' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message || 'Error de autenticación' });
    }
  }, [navigate, searchParams]);

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-slate-600">Procesando autenticación…</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="bg-white shadow p-6 rounded-md">
          <p className="text-rose-600 font-medium">Error</p>
          <p className="text-sm text-slate-600 mt-1">{state.error}</p>
          <a href="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">Volver a login</a>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
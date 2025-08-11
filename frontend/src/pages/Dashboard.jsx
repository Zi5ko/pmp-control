import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, client, logout } = useAuth();
  const [ping, setPing] = useState('…');

  useEffect(() => {
    const test = async () => {
      try {
        const { data } = await client.get('/health'); // tu backend ya tiene /api/health
        setPing(data?.ok ? 'ok' : 'fail');
      } catch {
        setPing('fail');
      }
    };
    test();
  }, [client]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Panel</h1>
          <button onClick={logout} className="text-sm text-rose-600 hover:underline">Cerrar sesión</button>
        </div>
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <p className="text-slate-700">Hola {user?.email || 'usuario'} 👋</p>
          <p className="text-sm text-slate-500 mt-1">Backend health: <b>{ping}</b></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_URL;

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [user, setUser] = useState(null);

  // Configurar axios una sola vez
  const client = useMemo(() => {
    const instance = axios.create({ baseURL: API, withCredentials: true });
    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem('auth_token');
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    instance.interceptors.response.use(
      r => r,
      err => {
        if (err?.response?.status === 401) {
          localStorage.removeItem('auth_token');
          setToken('');
          setUser(null);
          // opcional: redirigir al login
        }
        return Promise.reject(err);
      }
    );
    return instance;
  }, [API]);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken('');
    setUser(null);
    window.location.href = '/login';
  };

  // Cargar perfil (si tienes /auth/me en el backend)
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const { data } = await client.get('/auth/me'); // crea un endpoint simple que devuelva {id,email,rol_id}
        setUser(data);
      } catch {
        // si falla, limpiamos
        logout();
      }
    };
    fetchMe();
  }, [token, client]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, client, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !user) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const loginCreds = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const loginGoogle = async (id_token) => {
    const { data } = await axios.post(`${API}/auth/google`, { id_token });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loginCreds, loginGoogle, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

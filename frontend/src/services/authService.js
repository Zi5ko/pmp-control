import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
  localStorage.setItem("token", data.token);
};

export const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const { data } = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (e) {
    logout();
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

export function getUsuario() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub, email: payload.email, rol_id: payload.rol_id };
  } catch {
    return null;
  }
}
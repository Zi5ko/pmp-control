import api from "./api";

// Obtener usuarios técnicos
export async function getTecnicos() {
  const { data } = await api.get("/usuarios/tecnicos");
  return data;
}
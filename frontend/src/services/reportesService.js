// frontend/src/services/reportesService.js
import api from "./api";

// Obtener órdenes validadas (para generar reportes firmados)
export const getOrdenesValidadas = async () => {
  const response = await api.get("/ordenes/validadas");
  return response.data;
};

// Generar reporte PDF con firmas (payload debe incluir ambas firmas en base64)
export const generarPDF = async (id, payload) => {
  const response = await api.post(`/ordenes/${id}/reporte`, payload, {
    responseType: "blob", // importante para recibir PDF como archivo
  });
  return response.data;
};
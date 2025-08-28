// frontend/src/services/reportesService.js
import api from "./api";


// Obtener órdenes validadas (para generar reportes firmados)
export const getOrdenesValidadas = async () => {
  const response = await api.get("/ordenes/validadas");
  return response.data;
};

// Generar reporte PDF con firmas (usa interceptor)
export const generarPDF = async (id, payload) => {
  const response = await api.post(`/ordenes/${id}/generar-reporte`, payload, {
    responseType: "blob", // ¡solo esto es necesario!
  });
  return response.data;
};

// Descargar reporte PDF (con token en headers)
export const descargarReportePDF = async (nombreArchivo) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/reportes/descargar/${nombreArchivo}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al descargar el archivo");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();

  window.URL.revokeObjectURL(url);
};
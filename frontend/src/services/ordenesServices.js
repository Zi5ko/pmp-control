// src/services/ordenesServices.js
import api from "./api";

export async function getOrdenesPendientes() {
  const { data } = await api.get("/ordenes/pendientes-asignadas");
  return data;
}

// Obtener órdenes pendientes sin técnico asignado
export async function getOrdenesSinResponsable() {
  const { data } = await api.get("/ordenes/pendientes-sin-responsable");
  return data;
}

// Asignar orden a un técnico
export async function asignarOrden(ordenId, usuarioId) {
  const { data } = await api.put(`/ordenes/${ordenId}/asignar`, {
    usuario_id: usuarioId,
  });
  return data;
}

// Obtener órdenes ejecutadas por un técnico
export const getOrdenesRealizadas = async () => {
  const response = await api.get("/ordenes/realizadas");
  return response.data;
};

// Obtener órdenes pendientes de validación
export async function getOrdenesEjecutadas() {
  const response = await api.get("/ordenes/ejecutadas/no-validadas");
  return response.data;
}

// Validar una orden ejecutada
export async function validarOrden(id, payload) {
  const response = await api.put(`/ordenes/${id}/validar`, payload);
  return response.data;
}

// Obtener historial de órdenes
export const getHistorialOrdenes = async () => {
  const response = await api.get("/ordenes/historial");
  return response.data;
};

export const exportarHistorialExcel = async () => {
  const response = await api.get("/ordenes/historial/excel", { responseType: "blob" });
  return response.data; // Blob
};

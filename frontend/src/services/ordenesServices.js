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
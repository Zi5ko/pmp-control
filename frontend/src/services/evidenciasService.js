// src/services/evidenciasService.js
import api from './api';

export const getEvidenciasPorOrden = async (ordenId) => {
  const response = await api.get(`/evidencias/${ordenId}`);
  return response.data;
};

export const deleteEvidencia = async (id) => {
  const response = await api.delete(`/evidencias/${id}`);
  return response.data;
};

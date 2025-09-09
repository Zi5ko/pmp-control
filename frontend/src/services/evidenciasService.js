// src/services/evidenciasService.js
import api from './api';

export const getEvidenciasPorOrden = async (ordenId) => {
  const response = await api.get(`/evidencias/${ordenId}`);
  return response.data;
};


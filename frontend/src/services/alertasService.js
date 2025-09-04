// src/frontend/alertasService.js
import api from './api';

export const generarAlertas = async () => {
  await api.get('/alertas/generar');
};

export const obtenerAlertas = async () => {
  const response = await api.get('/alertas');
  return response.data;
};
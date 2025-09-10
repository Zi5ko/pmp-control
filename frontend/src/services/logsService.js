// frontend/src/services/logsService.js
import api from "./api";

export const obtenerLogs = async () => {
  const response = await api.get("/logs");
  return response.data;
};

export const exportarLogsExcel = async () => {
  const response = await api.get("/logs/excel", { responseType: "blob" });
  return response.data; // Blob
};

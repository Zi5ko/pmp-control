// frontend/src/services/evidenciasService.js

// Descarga una evidencia protegida y devuelve el blob del archivo
export const descargarEvidencia = async (ruta) => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/uploads/${ruta.replace(/^\\/|^uploads\\//, "")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener la evidencia");
  }

  return await response.blob();
};


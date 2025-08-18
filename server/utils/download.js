// src/utils/download.js
export function descargarArchivo(nombreArchivo) {
    const url = `${import.meta.env.VITE_API_URL}/uploads/${nombreArchivo}`;
  
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
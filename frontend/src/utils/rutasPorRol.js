// src/utils/rutasPorRol.js
export function getRutaPorRol(rol_nombre) {
    const rutas = {
      administrador: "/administrador",
      técnico: "/tecnico",
      supervisor: "/supervisor",
      responsable_institucional: "/responsable",
      esmp: "/esmp"
    };
    return rutas[rol_nombre] || "/login";
  }
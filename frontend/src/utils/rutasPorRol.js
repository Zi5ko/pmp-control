// frontend/src/utils/rutasPorRol.js

const normalizarRol = (rol) =>
  rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const getRutaPorRol = (rolNombre) => {
  const rol = normalizarRol(rolNombre);

  switch (rol) {
    case "administrador":
      return "/administrador";
    case "tecnico":
      return "/tecnico";
    case "supervisor":
      return "/supervisor";
    case "responsable institucional":
      return "/responsable-institucional";
    case "esmp":
      return "/esmp";
    default:
      return "/login";
  }
};
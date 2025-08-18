// middlewares/roles.js

/**
 * Middleware para permitir acceso solo a ciertos roles
 * @param {Array<number>} rolesPermitidos - Array con los ID de roles permitidos
 * @returns middleware
 */
function permitirRoles(rolesPermitidos = []) {
    return (req, res, next) => {
      const user = req.user;
  
      if (!user || !user.rol_id) {
        return res.status(401).json({ error: "Usuario no autenticado o sin rol" });
      }
  
      if (!rolesPermitidos.includes(user.rol_id)) {
        return res.status(403).json({ error: "Acceso no autorizado para este rol" });
      }
  
      next(); // Tiene permiso, continúa
    };
  }
  
  module.exports = { permitirRoles };
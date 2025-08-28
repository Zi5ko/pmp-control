// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se definen roles permitidos, validar contra el rol_id del usuario
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol_id)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children ? children : <Outlet />;
}
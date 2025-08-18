import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.rol_nombre !== role) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Revisar si el token es válido
  return children ? children : <Outlet />;
}
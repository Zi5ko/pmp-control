// frontend/src/pages/dashboard/DashboardRouter.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRutaPorRol } from "../../utils/rutasPorRol";

export default function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored) {
      navigate("/login");
      return;
    }

    navigate(getRutaPorRol(stored.rol_nombre));
  }, [navigate]);

  return null;
}
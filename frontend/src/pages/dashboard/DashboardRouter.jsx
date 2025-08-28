// frontend/src/pages/dashboard/DashboardRouter.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored) {
      navigate("/login");
      return;
    }

    const rol = stored.rol_nombre; // administrador, tecnico, supervisor, esmp, responsable_institucional

    if (rol) {
      navigate(`/${rol}`);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
}
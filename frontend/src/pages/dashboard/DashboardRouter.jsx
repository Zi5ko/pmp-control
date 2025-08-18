import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored) {
      // No hay sesión activa → redirigir al login
      return navigate("/login");
    }

    // Redirige según rol
    switch (stored.rol) {
      case "administrador":
        navigate("/admin");
        break;
      case "técnico":
        navigate("/tecnico");
        break;
      case "supervisor":
        navigate("/supervisor");
        break;
      case "responsable_institucional":
        navigate("/responsable");
        break;
      case "esmp":
        navigate("/esmp");
        break;
      default:
        navigate("/login");
        break;
    }
  }, [navigate]);

  return null; // No se muestra nada en esta ruta
}
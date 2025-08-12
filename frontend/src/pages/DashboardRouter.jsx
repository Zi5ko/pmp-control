import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        credentials: "include"
      })      
      .then(res => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then(user => {
        console.log("🧪 Usuario recibido:", user);  // 👈 prueba
        const rol = user.rol;
  
        switch (rol) {
          case 1: navigate("/admin"); break;
          case 2: navigate("/tecnico"); break;
          case 3: navigate("/supervisor"); break;
          case 5: navigate("/responsable"); break;
          case 6: navigate("/esmp"); break;
          default: navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);
  

  return <p>Cargando vista según rol...</p>;
}

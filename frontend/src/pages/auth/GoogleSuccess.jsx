import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      console.warn("❌ No se encontró token en la URL");
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);

    axios.get("http://localhost:3000/api/auth/me", {
      withCredentials: true
    })
      .then((res) => {
        const user = res.data;
        localStorage.setItem("user", JSON.stringify(user));

        // Redirección según rol_nombre
        switch (user.rol_nombre) {
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
            navigate("/no-autorizado");
        }
      })
      .catch((err) => {
        console.error("❌ Error en /me", err);
        navigate("/login");
      });
  }, [navigate, searchParams]);

  return (
    <div className="p-4 text-center">
      <p>Iniciando sesión con Google...</p>
    </div>
  );
}
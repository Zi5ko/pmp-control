//frontend/src/pages/auth/GoogleSuccess.jsx
import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRutaPorRol } from "../../utils/rutasPorRol";

const apiUrl = import.meta.env.VITE_API_URL;

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

    axios.get(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((res) => {
        const user = res.data;
        localStorage.setItem("user", JSON.stringify(user));
        navigate(getRutaPorRol(user.rol_nombre));
      })
      .catch((err) => {
        console.error("❌ Error al obtener usuario:", err);
        localStorage.removeItem("token");
        localStorage.setItem("login_error", "Acceso denegado. Cuenta no registrada.");
        navigate("/login?error=google_server");
      });
  }, [navigate, searchParams]);

  return (
    <div className="p-4 text-center">
      <p>Iniciando sesión con Google...</p>
    </div>
  );
}

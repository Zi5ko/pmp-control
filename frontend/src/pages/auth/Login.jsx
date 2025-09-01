// frontend/src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/hosdip logo_Logo Original.png";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye } from "react-icons/fi";
import ErrorBanner from "../../components/ErrorBanner"; // IMPORTACIÓN
import { useSearchParams } from "react-router-dom";

function getRutaPorRol(rol_nombre) {
  const rutas = {
    administrador: "/administrador",
    técnico: "/tecnico",
    supervisor: "/supervisor",
    responsable_institucional: "/responsable-institucional",
    esmp: "/esmp"
  };
  return rutas[rol_nombre] || "/login";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(null); // NUEVO

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password: pass
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = getRutaPorRol(data.user.rol_nombre);
    } catch (error) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "google") {
      setError("Tu cuenta de Google no está autorizada para ingresar al sistema.");
    }
  }, [searchParams]);

  return (
    <>
      {error && (
        <ErrorBanner
          title="Acceso denegado"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="HOSDIP" className="w-[180px] mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Ingresa a tu cuenta</h2>
            <p className="text-sm text-gray-500">Bienvenido de vuelta, selecciona un método de inicio</p>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-100 mb-4"
          >
            <FcGoogle size={20} />
            Google
          </a>

          <div className="flex items-center justify-center text-sm text-gray-400 mb-4">
            <div className="h-px bg-gray-300 flex-grow mx-2" /> o continúa con tu email <div className="h-px bg-gray-300 flex-grow mx-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <FiEye className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-1 text-gray-600">
                <input type="checkbox" className="accent-blue-600" /> Recuérdame
              </label>
              <a href="/recuperar" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E1E2F] text-white py-2 rounded-full hover:bg-[#2a2a3f]"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Hospital DIPRECA
          </p>
        </div>
      </div>
    </>
  );
}
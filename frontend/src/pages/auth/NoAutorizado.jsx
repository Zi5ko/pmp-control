import { Link } from "react-router-dom";

export default function NoAutorizado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white px-8 py-10 rounded-2xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">Acceso denegado</h1>
        <p className="text-gray-700 text-base">
          No tienes permisos para acceder a esta sección del sistema.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
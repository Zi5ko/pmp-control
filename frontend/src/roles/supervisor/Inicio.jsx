import { useEffect } from "react";

export default function InicioSupervisor() {
  useEffect(() => {
    document.title = "Inicio - Supervisor";
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Bienvenido, Supervisor</h1>
      <p className="text-gray-700">
        Desde aquí puedes validar y aprobar los mantenimientos realizados por los técnicos. Navega con el menú lateral.
      </p>
    </div>
  );
}
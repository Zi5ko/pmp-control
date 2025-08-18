import { useEffect } from "react";

export default function InicioESMP() {
  useEffect(() => {
    document.title = "Inicio - ESMP";
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Bienvenido, ESMP</h1>
      <p className="text-gray-700">
        Aquí puedes planificar, registrar y auditar mantenimientos, así como gestionar usuarios y equipos. Usa el menú lateral para acceder.
      </p>
    </div>
  );
}
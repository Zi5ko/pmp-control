import { useEffect } from "react";

export default function InicioTecnico() {
  useEffect(() => {
    document.title = "Inicio - Técnico";
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Bienvenido, Técnico</h1>
      <p className="text-gray-700">
        Desde este panel puedes registrar mantenimientos y consultar tus tareas asignadas. Utiliza el menú lateral para acceder a tus funciones.
      </p>
    </div>
  );
}
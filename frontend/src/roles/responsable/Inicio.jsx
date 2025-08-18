import { useEffect } from "react";

export default function InicioResponsable() {
  useEffect(() => {
    document.title = "Inicio - Responsable Institucional";
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Bienvenido, Responsable Institucional</h1>
      <p className="text-gray-700">
        Accede a auditorías, planificación, reportes estratégicos y validación de mantenimientos. Supervisa el funcionamiento integral del sistema.
      </p>
    </div>
  );
}
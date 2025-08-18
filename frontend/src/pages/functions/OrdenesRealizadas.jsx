import { useEffect, useState } from "react";
import { getOrdenesRealizadas } from "../../services/ordenesServices";

export default function OrdenesRealizadas() {
  const [ordenes, setOrdenes] = useState([]);

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesRealizadas();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar órdenes realizadas:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Órdenes Ejecutadas</h1>

      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-500">Aún no has ejecutado ninguna orden.</p>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border rounded-lg p-4 bg-white shadow">
              <p className="text-sm"><strong>Equipo:</strong> {orden.equipo_nombre}</p>
              <p className="text-sm"><strong>Ubicación:</strong> {orden.ubicacion}</p>
              <p className="text-sm"><strong>Fecha Programada:</strong> {orden.fecha_programada}</p>
              <p className="text-sm"><strong>Fecha de Ejecución:</strong> {orden.fecha_ejecucion}</p>
              {/* 🔜 Visualización de evidencias aquí */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
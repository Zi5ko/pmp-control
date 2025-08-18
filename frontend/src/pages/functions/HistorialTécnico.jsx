import { useEffect, useState } from "react";
import { getOrdenesRealizadas } from "../../services/ordenesServices";

export default function HistorialTecnico() {
  const [ordenes, setOrdenes] = useState([]);

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesRealizadas();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Historial de mantenimientos ejecutados</h1>

      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron mantenimientos ejecutados.</p>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border rounded-lg p-4 bg-white shadow">
              <p className="text-sm text-gray-700">
                <strong>Equipo:</strong> {orden.equipo_nombre || "Sin nombre"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Ubicación:</strong> {orden.ubicacion || "No especificada"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Fecha ejecución:</strong> {orden.fecha_ejecucion?.slice(0, 10) || "No registrada"}
              </p>

              {/* Aquí puedes agregar las evidencias si se cargan dentro del objeto orden */}
              {orden.evidencias?.length > 0 ? (
                <div className="mt-2">
                  <p className="font-semibold text-sm mb-1">Evidencias:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {orden.evidencias.map((ev, idx) => (
                      <li key={idx}>
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {ev.tipo} - {ev.url.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No se adjuntaron evidencias.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
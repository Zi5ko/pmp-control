// src/pages/functions/Reportes.jsx
import { useEffect, useState } from "react";
import ModalEjecutarOrden from "../../components/ordenes/ModalEjecutarOrden";
import { getOrdenesPendientes } from "../../services/ordenesServices";

export default function Reportes() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesPendientes();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Ejecutar mantenimiento</h1>

      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-500">No hay órdenes pendientes por ejecutar.</p>
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
                <strong>Fecha programada:</strong> {orden.fecha_programada}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Responsable asignado:</span>{" "}
                {orden?.responsable_nombre && orden?.responsable_nombre.trim() !== ''
                  ? orden.responsable_nombre
                  : 'Sin asignar'}
              </p>

              <button
                onClick={() => setOrdenSeleccionada(orden.id)}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ejecutar orden
              </button>
            </div>
          ))}
        </div>
      )}

      {ordenSeleccionada && (
        <ModalEjecutarOrden
        ordenId={ordenSeleccionada}
        onClose={() => setOrdenSeleccionada(null)}
        onSuccess={fetchOrdenes}
      />
      )}
    </div>
  );
}
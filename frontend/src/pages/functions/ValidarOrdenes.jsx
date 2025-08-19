//src/components/pages/functions/ValidarOrdenes.jsx
import { useEffect, useState } from "react";
import { getOrdenesEjecutadas, validarOrden } from "../../services/ordenesServices";

export default function OrdenesRealizadas() {
  const [ordenes, setOrdenes] = useState([]);
  const [comentarios, setComentarios] = useState({});

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesEjecutadas();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar órdenes ejecutadas:", error);
    }
  };

  const handleComentarioChange = (id, value) => {
    setComentarios((prev) => ({ ...prev, [id]: value }));
  };

  const handleValidar = async (id, validada) => {
    try {
      await validarOrden(id, {
        validada,
        comentario: comentarios[id] || "",
      });
      fetchOrdenes(); // recargar
    } catch (error) {
      console.error("Error al validar orden:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Validación de Mantenimientos</h1>

      {ordenes.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay órdenes pendientes de validación.</p>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white p-4 rounded-lg shadow border">
              <p><strong>Equipo:</strong> {orden.equipo_nombre}</p>
              <p><strong>Ubicación:</strong> {orden.ubicacion}</p>
              <p><strong>Técnico:</strong> {orden.tecnico_nombre || "No asignado"}</p>
              <p><strong>Fecha ejecución:</strong> {new Date(orden.fecha_ejecucion).toLocaleDateString()}</p>
              <p><strong>Evidencias:</strong> {orden.total_evidencias} archivo(s)</p>

              <textarea
                className="w-full mt-2 p-2 border rounded text-sm"
                placeholder="Comentario del supervisor"
                value={comentarios[orden.id] || ""}
                onChange={(e) => handleComentarioChange(orden.id, e.target.value)}
              />

              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  onClick={() => handleValidar(orden.id, true)}
                >
                  Validar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  onClick={() => handleValidar(orden.id, false)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
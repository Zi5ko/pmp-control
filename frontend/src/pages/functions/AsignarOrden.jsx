// src/pages/functions/AsignarOrdenes.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AsignarOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [asignando, setAsignando] = useState(null);

  const fetchOrdenes = async () => {
    try {
      const { data } = await api.get("/ordenes/pendientes-sin-responsable");
      setOrdenes(data);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const { data } = await api.get("/usuarios/tecnicos");
      setTecnicos(data);
    } catch (err) {
      console.error("Error al cargar técnicos:", err);
    }
  };

  const asignarResponsable = async (ordenId, responsableId) => {
    try {
      await api.put(`/ordenes/${ordenId}/asignar`, { responsable_id: responsableId });
      await fetchOrdenes();
    } catch (err) {
      console.error("Error al asignar técnico:", err);
      alert("No se pudo asignar la orden.");
    } finally {
      setAsignando(null);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    fetchTecnicos();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Asignar órdenes a técnicos</h1>

      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-500">No hay órdenes sin asignar por el momento.</p>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border rounded-lg p-4 bg-white shadow">
              <p className="text-sm text-gray-700"><strong>Equipo:</strong> {orden.equipo_nombre}</p>
              <p className="text-sm text-gray-700"><strong>Ubicación:</strong> {orden.ubicacion}</p>
              <p className="text-sm text-gray-700"><strong>Fecha programada:</strong> {orden.fecha_programada}</p>

              <div className="mt-2">
                <select
                  className="border p-1 rounded text-sm"
                  value={asignando === orden.id ? "" : ""}
                  onChange={(e) => asignarResponsable(orden.id, e.target.value)}
                  disabled={asignando === orden.id}
                >
                  <option value="">Asignar técnico...</option>
                  {tecnicos.map((tec) => (
                    <option key={tec.id} value={tec.id}>
                      {tec.nombre} ({tec.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
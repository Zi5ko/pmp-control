// src/pages/functions/Reportes.jsx
import { useEffect, useState } from "react";
import ModalEjecutarOrden from "../../components/ordenes/ModalEjecutarOrden";
import { getOrdenesPendientes } from "../../services/ordenesServices";
import { Search } from "lucide-react";
import MiniCalendar from "../../components/MiniCalendar";

const formatearCodigo = (prefijo, id) => `${prefijo}${String(id).padStart(4, "0")}`;

export default function Reportes() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");

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

  const ordenesFiltradas = ordenes.filter((orden) =>
    orden.equipo_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font mb-4">Ejecutar Mantenimiento</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar mantenimiento"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D0FF34]"
          />
        </div>
      </div>

      {ordenesFiltradas.length === 0 ? (
        <p className="text-sm text-gray-500">No hay órdenes pendientes por ejecutar.</p>
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">ID</th>
                <th className="p-3">OT</th>
                <th className="p-3">Equipo</th>
                <th className="p-3">Serie</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Fecha programada</th>
                <th className="p-3">Responsable</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="border-t">
                  <td className="p-3 text-sm text-gray-800">{formatearCodigo("ID", orden.equipo_id)}</td>
                  <td className="p-3 text-sm text-gray-800">{formatearCodigo("OT", orden.id)}</td>
                  <td className="p-3 text-sm text-gray-600">{orden.equipo_nombre || "-"}</td>
                  <td className="p-3 text-sm text-gray-600">{orden.equipo_serie || "-"}</td>
                  <td className="p-3 text-sm text-gray-600">{orden.ubicacion || "-"}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(orden.fecha_programada).toLocaleDateString("es-CL")}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden?.responsable_nombre?.trim() || <span className="italic text-gray-400">Sin asignar</span>}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setOrdenSeleccionada(orden)}
                      className="bg-[#D0FF34] text-[#111A3A] px-6 py-1 rounded shadow hover:bg-lime-300"
                    >
                      <span className="text-sm">Ejecutar Orden</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {/* Calendario a la derecha */}
          <div className="w-full md:w-1/3 lg:w-1/4 mt-4 md:mt-0">
            <div>
              <MiniCalendar />
            </div>
          </div>
        </div>
      )}

      {/* Modal estilo banner flotante */}
      {ordenSeleccionada && (
        <ModalEjecutarOrden
          ordenId={ordenSeleccionada.id}
          equipoId={ordenSeleccionada.equipo_id}
          equipoSerie={ordenSeleccionada.equipo_serie}
          equipoNombre={ordenSeleccionada.equipo_nombre}
          equipoUbicacion={ordenSeleccionada.ubicacion}
          observacionesPrevias={ordenSeleccionada.observaciones}
          onClose={() => setOrdenSeleccionada(null)}
          onSuccess={fetchOrdenes}
        />
      )}
    </div>
  );
}
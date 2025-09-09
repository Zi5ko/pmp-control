//frontend/src/pages/functions/ValidarOrdenes.jsx
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";
import MiniCalendar from "../../components/MiniCalendar";
import { getOrdenesEjecutadas, validarOrden } from "../../services/ordenesServices";
import { getEvidenciasPorOrden } from "../../services/evidenciasService";
import DetalleOrdenModal from "../../components/ordenes/DetalleOrdenModal";

const formatearCodigo = (prefijo, id) => `${prefijo}${String(id).padStart(4, "0")}`;

export default function ValidarOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [comentario, setComentario] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [evidencias, setEvidencias] = useState([]);

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesEjecutadas();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar órdenes ejecutadas:", error);
      setMensaje({ tipo: "error", texto: "Error al cargar órdenes." });
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    const filtradas = ordenesFiltradas;
    if (seleccionados.length === filtradas.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(filtradas.map((o) => o.id));
    }
  };

  const verDetalle = async (orden) => {
    setOrdenDetalle(orden);
    try {
      const data = await getEvidenciasPorOrden(orden.id);
      setEvidencias(data);
    } catch (error) {
      console.error("Error al obtener evidencias:", error);
      setEvidencias([]);
    }
  };

  const handleAccion = async (validada) => {
    if (seleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Selecciona al menos una orden." });
      return;
    }

    try {
      await Promise.all(
        seleccionados.map((id) =>
          validarOrden(id, { validada, comentario })
        )
      );
      setMensaje({
        tipo: "success",
        texto: validada ? "Órdenes validadas." : "Órdenes rechazadas.",
      });
      setComentario("");
      setSeleccionados([]);
      fetchOrdenes();
    } catch (error) {
      console.error("Error al validar órdenes:", error);
      setMensaje({ tipo: "error", texto: "Error al validar órdenes." });
    }
  };

  const ordenesFiltradas = ordenes.filter((o) =>
    o.equipo_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    
      <div className="p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner
          title="Éxito"
          message={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner
          title="Error"
          message={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}

      <h1 className="text-2xl font mb-4">Validación de Mantenimientos</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar equipo"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D0FF34]"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Tabla de órdenes */}
        <div className="flex-1 overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={seleccionados.length === ordenesFiltradas.length}
                    onChange={seleccionarTodos}
                  />
                </th>
                <th className="p-3">ID</th>
                <th className="p-3">OT</th>
                <th className="p-3">Equipo</th>
                <th className="p-3">Serie</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Técnico</th>
                <th className="p-3">Ejecución</th>
                <th className="p-3">Evidencias</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(orden.id)}
                      onChange={() => toggleSeleccion(orden.id)}
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-800">
                    {formatearCodigo("ID", orden.equipo_id)}
                  </td>
                  <td className="p-3 text-sm text-gray-800">
                    {formatearCodigo("OT", orden.id)}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden.equipo_nombre}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden.equipo_serie}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden.ubicacion}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden.tecnico_nombre || "-"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(orden.fecha_ejecucion).toLocaleDateString("es-CL")}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {orden.total_evidencias} archivo(s)
                    <button
                      onClick={() => verDetalle(orden)}
                      className="ml-2 bg-[#D0FF34] text-[#111A3A] font-semibold text-xs px-2 py-1 rounded shadow hover:bg-lime-300"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calendario a la derecha */}
        <div className="w-full md:w-1/3 lg:w-1/4 mt-4 md:mt-0">
          <MiniCalendar />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-medium text-gray-700">
        Comentario del supervisor
      </h2>

      <div className="mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded text-sm resize-none"
          rows={3}
          placeholder="Comentario general para la validación o rechazo de mantenimientos seleccionados"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={() => handleAccion(true)}
            className="bg-[#D0FF34] text-[#111A3A] font-semibold text-sm px-6 py-2 rounded shadow hover:bg-lime-300"
          >
            Validar órden(es)
          </button>
          <button
            onClick={() => handleAccion(false)}
            className="bg-red-600 text-white text-sm font-semibold px-6 py-2 rounded shadow hover:bg-red-700"
          >
            Rechazar órden(es)
          </button>
        </div>
      </div>
      {ordenDetalle && (
        <DetalleOrdenModal
          orden={ordenDetalle}
          evidencias={evidencias}
          onClose={() => setOrdenDetalle(null)}
        />
      )}
    </div>
  );
}
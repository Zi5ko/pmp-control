import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../../services/api";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";
import MiniCalendar from "../../components/MiniCalendar";

const formatearID = (id) => `ID${String(id).padStart(4, "0")}`;

export default function AsignarOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [tecnicoAsignado, setTecnicoAsignado] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const fetchOrdenes = async () => {
    try {
      const { data } = await api.get("/ordenes/pendientes-sin-responsable");
      setOrdenes(data);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setMensaje({ tipo: "error", texto: "Error al cargar órdenes." });
    }
  };

  const fetchTecnicos = async () => {
    try {
      const { data } = await api.get("/usuarios/tecnicos");
      setTecnicos(data);
    } catch (err) {
      console.error("Error al cargar técnicos:", err);
      setMensaje({ tipo: "error", texto: "Error al cargar técnicos." });
    }
  };

  useEffect(() => {
    fetchOrdenes();
    fetchTecnicos();
  }, []);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    const ordenesFiltradas = ordenes.filter((o) =>
      o.equipo_nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    if (seleccionados.length === ordenesFiltradas.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(ordenesFiltradas.map((o) => o.id));
    }
  };

  const handleAsignar = async () => {
    if (!tecnicoAsignado || seleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Selecciona órdenes y técnico." });
      return;
    }

    try {
      await Promise.all(
        seleccionados.map((id) =>
          api.put(`/ordenes/${id}/asignar`, { responsable_id: tecnicoAsignado })
        )
      );
      setMensaje({ tipo: "success", texto: "Órdenes asignadas con éxito." });
      setSeleccionados([]);
      setTecnicoAsignado("");
      fetchOrdenes();
    } catch (err) {
      console.error("Error al asignar técnico:", err);
      setMensaje({ tipo: "error", texto: "Error al asignar técnico." });
    }
  };

  const ordenesFiltradas = ordenes.filter((o) =>
    o.equipo_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner title="Éxito" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner title="Error" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}

      <h1 className="text-2xl font mb-4">Asignación de Órdenes de Trabajo</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
        {/* Tabla de órdenes a la izquierda */}
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
                <th className="p-3">Equipo</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Fecha Programada</th>
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
                  <td className="p-3 text-sm text-gray-800">{formatearID(orden.id)}</td>
                  <td className="p-3 text-sm text-gray-600">{orden.equipo_nombre}</td>
                  <td className="p-3 text-sm text-gray-600">{orden.ubicacion}</td>
                  <td className="p-3 text-sm text-gray-600">{new Date(orden.fecha_programada).toLocaleDateString("es-CL")}</td>
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

      <h2 className="mt-8 text-lg font-medium text-gray-700">Asignar Técnico</h2>
      <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow mb-6">
        <div className="w-full sm:w-auto">
          <label htmlFor="tecnico_asignado" className="block text-sm font-medium text-gray-700 mb-1">
            Técnico responsable
          </label>
          <select
            id="tecnico_asignado"
            value={tecnicoAsignado}
            onChange={(e) => setTecnicoAsignado(e.target.value)}
            className="w-full bg-white border border-gray-300 text-sm px-4 py-2 rounded-lg shadow-sm"
          >
            <option value="">Selecciona un técnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAsignar}
          className="bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:bg-lime-300"
        >
          Asignar órdenes
        </button>
      </div>
    </div>
  );
}
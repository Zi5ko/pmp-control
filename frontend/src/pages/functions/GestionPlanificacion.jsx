// frontend/src/pages/functions/GestionPlanificacion.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";

const formatearID = (id) => `ID${String(id).padStart(4, "0")}`;

export default function GestionPlanificacion() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchParams, setSearchParams] = useSearchParams();

  const [equipos, setEquipos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [fecha, setFecha] = useState("");
  const [fechaReprogramacion, setFechaReprogramacion] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [modoReprogramacion, setModoReprogramacion] = useState(false);
  const [ordenInfo, setOrdenInfo] = useState(null);

  const ordenId = searchParams.get("orden_id");
  const equipoIdParam = searchParams.get("equipo_id");
  const fechaAnterior = searchParams.get("fecha_anterior");

  useEffect(() => {
    const rolId = Number(user?.rol_id);
    if (!user || ![1, 5, 6].includes(rolId)) {
      navigate("/no-autorizado");
    }
  }, [navigate, user]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/ordenes/faltantes`)
      .then((res) => {
        setEquipos(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar equipos sin orden:", err);
        setMensaje({ tipo: "error", texto: "Error al cargar equipos." });
      });
  }, []);

  useEffect(() => {
    if (ordenId && equipoIdParam && fechaAnterior) {
      setModoReprogramacion(true);
    }
  }, [ordenId, equipoIdParam, fechaAnterior]);

  useEffect(() => {
    if (modoReprogramacion && ordenId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/ordenes/${ordenId}/detalle`)
        .then((res) => setOrdenInfo(res.data))
        .catch((err) => {
          console.error("Error al cargar datos de la orden:", err);
        });
    }
  }, [modoReprogramacion, ordenId]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === equiposFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(equiposFiltrados.map((eq) => eq.equipo_id));
    }
  };

  const handleSubmit = async () => {
    if (!fecha || seleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Selecciona equipos y fecha." });
      return;
    }

    try {
      await Promise.all(
        seleccionados.map((id) =>
          axios.post(`${import.meta.env.VITE_API_URL}/ordenes`, {
            equipo_id: id,
            fecha_programada: fecha,
            estado: "pendiente",
          })
        )
      );
      setMensaje({ tipo: "success", texto: "Mantenimientos programados con éxito." });
      setSeleccionados([]);
      setFecha("");
    } catch (err) {
      console.error("Error al programar:", err);
      setMensaje({ tipo: "error", texto: "Error al programar mantenimientos." });
    }
  };

  const equiposFiltrados = equipos.filter((eq) =>
    eq.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleReprogramar = async () => {
    if (!fechaReprogramacion) {
      setMensaje({ tipo: "error", texto: "Selecciona una nueva fecha." });
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/ordenes/${ordenId}/estado`,
        { estado: "reprogramada" }
      );

      await axios.post(`${import.meta.env.VITE_API_URL}/ordenes`, {
        equipo_id: Number(equipoIdParam),
        fecha_programada: fechaReprogramacion,
        estado: "pendiente",
      });

      setMensaje({
        tipo: "success",
        texto: "Mantenimiento reprogramado con éxito.",
      });
      setFechaReprogramacion("");
      setModoReprogramacion(false);
      setSearchParams({});
    } catch (err) {
      console.error("Error al reprogramar:", err);
      setMensaje({
        tipo: "error",
        texto: "Error al reprogramar mantenimiento.",
      });
    }
  };

  return (
    <div className="p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner title="Éxito" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner title="Error" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}

      <h1 className="text-2xl font mb-4">Planificación de Mantenimientos</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar Mantención"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D0FF34]"
          />
        </div>

      </div>

      <div
        className={`overflow-x-auto bg-white shadow rounded-xl ${
          modoReprogramacion ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={seleccionados.length === equiposFiltrados.length}
                  onChange={seleccionarTodos}
                />
              </th>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3">Criticidad</th>
              <th className="p-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.map((eq) => (
              <tr key={eq.equipo_id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(eq.equipo_id)}
                    onChange={() => toggleSeleccion(eq.equipo_id)}
                  />
                </td>
                <td className="p-3 text-sm text-gray-800">{formatearID(eq.equipo_id)}</td>
                <td className="p-3 text-sm text-gray-600">{eq.nombre}</td>
                <td className="p-3 text-sm text-gray-600">{eq.ubicacion}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    eq.criticidad === "crítico"
                      ? "bg-[#E01D00]/20 text-[#E01D00]"
                      : eq.criticidad === "relevante"
                      ? "bg-[#FFC700]/30 text-[#FFC700]"
                      : "bg-[#C4C4C4]/40 text-[#333]"
                  }`}>
                    {eq.criticidad}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">{eq.plan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modoReprogramacion ? (
        <>
          <div>
            <h2 className="mt-8 text-lg font-medium text-gray-700">
              Reprogramar mantenimiento
            </h2>
          </div>
          <div className="mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow mb-6">
            {ordenInfo && (
              <div className="text-sm text-gray-700 mb-4">
                <p>
                  <span className="font-medium">Equipo:</span> {ordenInfo.equipo_nombre}
                </p>
                <p>
                  <span className="font-medium">Ubicación:</span> {ordenInfo.ubicacion}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {formatearID(equipoIdParam)}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Fecha original: {new Date(fechaAnterior).toLocaleDateString("es-CL")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="date"
                value={fechaReprogramacion}
                onChange={(e) => setFechaReprogramacion(e.target.value)}
                className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
              />
              <button
                onClick={handleReprogramar}
                className="bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:bg-lime-300"
              >
                Guardar reprogramación
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="mt-8 text-lg font-medium text-gray-700">
              Confirmar Programa de Mantenimiento
            </h2>
          </div>

          {/* CONTENEDOR DE FECHA + BOTÓN */}
          <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow mb-6">
            {/* Label + Input fecha */}
            <div className="w-full sm:w-auto">
              <label
                htmlFor="fecha_programada"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Ejecución
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 px-4 py-2 bg-white shadow-sm">
                <input
                  type="date"
                  id="fecha_programada"
                  name="fecha_programada"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-white text-sm text-gray-800 outline-none appearance-none"
                />
              </div>
            </div>

            {/* Botón de guardar */}
            <button
              onClick={handleSubmit}
              className=" bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:bg-lime-300"
            >
              Guardar planificación
            </button>
          </div>
        </>
      )}
    </div>
  );
}
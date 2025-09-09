import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import ErrorBanner from "../../components/ErrorBanner";
import { getRutaPorRol } from "../../utils/rutasPorRol";

export default function ListaEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [criticidadFiltro, setCriticidadFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const equiposPorPagina = 8;

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const basePath = getRutaPorRol(user?.rol_nombre);

  const normalizar = (texto) =>
    texto?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() || "";

  useEffect(() => {
    const rolId = Number(user?.rol_id);
    // Permitir acceso para Admin(1), ESMP(6) y Calidad(4)
    if (!user || ![1, 4, 6].includes(rolId)) {
      navigate("/no-autorizado");
    }
  }, [navigate, user]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/equipos`)
      .then((res) => setEquipos(res.data))
      .catch((err) => {
        console.error("❌ Error al cargar equipos:", err);
        setError("No se pudieron cargar los equipos. Intenta nuevamente.");
      });
  }, []);

  const formatoID = (id) => `ID${String(id).padStart(4, "0")}`;

  const estiloCriticidad = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case "crítico":
        return "bg-[#E01D00]/20 text-[#E01D00]";
      case "relevante":
        return "bg-[#FFC700]/30 text-[#FFC700]";
      default:
        return "bg-[#C4C4C4]/40 text-[#333]";
    }
  };

  const equiposFiltrados = equipos.filter((e) => {
    const texto = normalizar(busqueda);
    return (
      normalizar(e.nombre).includes(texto) ||
      normalizar(e.familia).includes(texto) ||
      normalizar(e.marca).includes(texto) ||
      normalizar(e.modelo).includes(texto) ||
      normalizar(e.serie).includes(texto) ||
      normalizar(e.ubicacion).includes(texto) ||
      normalizar(e.criticidad).includes(texto) ||
      normalizar(e.nombre_plan || "").includes(texto) ||
      normalizar(formatoID(e.id)).includes(texto)
    );
  });

  const equiposFiltradosPorCriticidad = criticidadFiltro
  ? equiposFiltrados.filter(e => e.criticidad?.toLowerCase() === criticidadFiltro)
  : equiposFiltrados;

  const totalPaginas = Math.ceil(equiposFiltradosPorCriticidad.length / equiposPorPagina);
  const inicio = (paginaActual - 1) * equiposPorPagina;
  const equiposPaginados = equiposFiltradosPorCriticidad.slice(inicio, inicio + equiposPorPagina);

  return (
    <div className="p-6">
      {error && (
        <ErrorBanner
          title="Error al cargar datos"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <h1 className="text-2xl font mb-6">Equipos Registrados</h1>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
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

          {/* Botones de criticidad */}
          <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            {[
              { label: "Crítico", value: "crítico" },
              { label: "Relevante", value: "relevante" },
              { label: "No Relevante", value: "no-relevante" },
            ].map((f) => {
              const activo = criticidadFiltro === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    const nuevoValor = f.value === "no-relevante" ? "otros" : f.value;
                    setCriticidadFiltro((prev) => (prev === nuevoValor ? "" : nuevoValor));
                  }
                  }
                  className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
                    activo
                      ? "bg-[#D0FF34] text-[#111A3A]"
                      : "text-gray-800 hover:text-black"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Familia</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Serie</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3">Criticidad</th>
              <th className="p-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {equiposPaginados.map((equipo) => (
              <tr key={equipo.id} className="border-t">
                <td className="p-3 text-sm text-gray-800">{formatoID(equipo.id)}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.nombre}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.familia}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.marca}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.modelo}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.serie}</td>
                <td className="p-3 text-sm text-gray-600">{equipo.ubicacion}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estiloCriticidad(
                      equipo.criticidad
                    )}`}
                  >
                    {equipo.criticidad || "-"}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {equipo.nombre_plan || <span className="text-gray-400 italic">Sin plan</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-4 w-full">
        {/* Botones de paginación a la izquierda */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            className="px-4 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        {/* Botón a la derecha */}
        <div className="ml-auto">
          {/* Solo roles con permiso de registro pueden ver el botón */}
          {([1, 6].includes(Number(user?.rol_id))) && (
            <button
              onClick={() => navigate(`${basePath}/equipos`)}
              className="bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:opacity-90"
            >
              Ingresar equipo
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

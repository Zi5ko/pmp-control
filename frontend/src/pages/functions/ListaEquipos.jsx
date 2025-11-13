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
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Equipos Registrados</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Nombre</th>
              <th className="border px-3 py-2">Familia</th>
              <th className="border px-3 py-2">Marca</th>
              <th className="border px-3 py-2">Modelo</th>
              <th className="border px-3 py-2">Serie</th>
              <th className="border px-3 py-2">Ubicación</th>
              <th className="border px-3 py-2">Criticidad</th>
              <th className="border px-3 py-2">Fecha ingreso</th>
              <th className="border px-3 py-2">Plan</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo) => (
              <tr key={equipo.id}>
                <td className="border px-3 py-1">{equipo.id}</td>
                <td className="border px-3 py-1">{equipo.nombre}</td>
                <td className="border px-3 py-1">{equipo.familia}</td>
                <td className="border px-3 py-1">{equipo.marca}</td>
                <td className="border px-3 py-1">{equipo.modelo}</td>
                <td className="border px-3 py-1">{equipo.serie}</td>
                <td className="border px-3 py-1">{equipo.ubicacion}</td>
                <td className="border px-3 py-1">{equipo.criticidad}</td>
                <td className="border px-3 py-1">{equipo.fecha_ingreso}</td>
                <td className="border px-3 py-1">{equipo.nombre_plan || "Sin plan"}</td>
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

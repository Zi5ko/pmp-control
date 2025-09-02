import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, CheckCircle } from "lucide-react";
import KpiCard from "../../components/KpiCard.jsx";
import MiniCalendar from "../../components/MiniCalendar.jsx";
import { getOrdenesPendientes, getHistorialOrdenes } from "../../services/ordenesServices.js";
import { obtenerLogs } from "../../services/logsService.js";
import { useAuth } from "../../pages/auth/AuthContext.jsx";

export default function InicioTecnico() {
  const { user } = useAuth();
  const [pendientes, setPendientes] = useState(0);
  const [ejecutadosMes, setEjecutadosMes] = useState(0);
  const [ultimasOrdenes, setUltimasOrdenes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Inicio - Técnico";

    // Evita solicitudes no autorizadas mientras el usuario aún no está cargado
    if (!user) return;

    const fetchPendientes = async () => {
      try {
        const data = await getOrdenesPendientes();
        setPendientes(data.length);
      } catch (err) {
        console.error("❌ Error al obtener pendientes:", err);
        setError("No se pudo cargar la información de órdenes.");
      }
    };

    const fetchHistorial = async () => {
      try {
        const data = await getHistorialOrdenes();
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const realizados = data.filter((o) => {
          const fecha = o.fecha_ejecucion ? new Date(o.fecha_ejecucion) : null;
          return fecha && fecha >= inicioMes && fecha <= ahora;
        });
        setEjecutadosMes(realizados.length);
        setUltimasOrdenes(data.slice(0, 5));
      } catch (err) {
        console.error("❌ Error al obtener historial:", err);
      }
    };

    const fetchLogs = async () => {
      try {
        const data = await obtenerLogs();
        const propios = data.filter((l) => l.usuario === user.nombre);
        setLogs(propios.slice(0, 5));
      } catch (err) {
        console.error("❌ Error al obtener logs:", err);
      }
    };

    fetchPendientes();
    fetchHistorial();
    fetchLogs();
  }, [user]);

  return (
    <div className="p-6 text-[#111A3A] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard value={pendientes} label="Mis Órdenes Pendientes" Icon={ClipboardList} color="#FBBF24" />
            <KpiCard value={ejecutadosMes} label="Mantenimientos este mes" Icon={CheckCircle} color="#34D399" />
          </div>
        </section>

        {/* Órdenes completadas y acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Últimas órdenes completadas</h2>
            {ultimasOrdenes.length === 0 ? (
              <p className="text-sm text-gray-400">No hay registros.</p>
            ) : (
              <ul className="text-sm text-gray-700 space-y-2">
                {ultimasOrdenes.map((orden) => (
                  <li key={orden.id}>
                    {orden.equipo_nombre || "Equipo"} – {new Date(orden.fecha_ejecucion).toLocaleDateString("es-CL")}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h2 className="text-lg font-semibold mb-4">Acciones recientes</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-400">No hay registros recientes.</p>
            ) : (
              <ul className="text-sm text-gray-700 space-y-2">
                {logs.map((log) => {
                  const fecha = new Date(log.fecha).toLocaleDateString("es-CL", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  });
                  return (
                    <li key={log.id}>
                      <span className="text-[#111A3A] font-semibold">{fecha}</span> – {log.usuario} <span className="italic">{log.accion}</span> en <span className="font-medium">{log.tabla_afectada}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Accesos directos */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Accesos directos</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/tecnico/registros-firmas" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Ejecutar mantenimiento
              </Link>
              <Link to="/tecnico/historial" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                Historial técnico
              </Link>
            </div>
          </div>
        </section>
      </div>

      <aside className="block">
        <MiniCalendar />
      </aside>
    </div>
  );
}

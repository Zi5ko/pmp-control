//frontend/src/roles/administrador/Inicio.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";
import KpiCard from "../../components/KpiCard.jsx";
import MiniCalendar from "../../components/MiniCalendar.jsx";
import { obtenerLogs }   from "../../services/logsService.js";

axios.defaults.withCredentials = true; // Asegura que se envíen cookies

export default function InicioAdmin() {
  const [resumen, setResumen] = useState({ total: 0, completadas: 0, pendientes: 0 });
  const [logs, setLogs] = useState([]);
  const [cumplimiento, setCumplimiento] = useState({ critico: { total: 0, firmadas: 0 }, relevante: { total: 0, firmadas: 0 } });
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Inicio - Administrador";

    const fetchResumen = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/resumen`, { withCredentials: true });
        setResumen(data);
      } catch (err) {
        console.error("❌ Error al obtener KPIs:", err);
        setError("No se pudo cargar el resumen.");
      }
    };

    const fetchLogs = async () => {
      try {
        const data = await obtenerLogs();
        setLogs(data.slice(0, 5)); // Limita a los 5 más recientes
      } catch (err) {
        console.error("❌ Error al obtener logs:", err);
      }
    };


    const fetchCumplimiento = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/cumplimiento-criticidad`);
        setCumplimiento(data);
      } catch (err) {
        console.error("❌ Error al obtener cumplimiento:", err);
      }
    };

    fetchResumen();
    fetchLogs();
    fetchCumplimiento();
  }, []);

  const dataChart = [
    { name: "Completadas", value: resumen.completadas },
    { name: "Pendientes", value: resumen.pendientes }
  ];

  const getPieColor = (name = "") => {
    const n = String(name).toLowerCase();
    if (n.includes("pendiente")) return "#D3DDE7"; // pendientes
    if (n.includes("completad") || n.includes("firmad")) return "#003D31"; // completadas/firmadas
    if (n.includes("realizad") || n.includes("ejecutad")) return "#D6B4FC"; // realizada/ejecutada (por si se usa)
    return "#E5E7EB"; // gris claro por defecto
  };

  const porcentaje = (parte, total) => total === 0 ? 0 : Math.round((parte / total) * 100);
  const { critico, relevante } = cumplimiento;

  return (
    <div className="p-6 text-[#111A3A] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      {/* Columna principal */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard value={resumen.total} label="Órdenes Totales" Icon={ClipboardList} />
            <KpiCard value={resumen.completadas} label="Completadas" Icon={CheckCircle} color="#34D399" />
            <KpiCard value={resumen.pendientes} label="Pendientes" Icon={Clock} color="#FBBF24" />
          </div>
        </section>

        {/* Resumen Visual y Acciones Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Resumen Visual</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  labelLine={false}
                  label={({ name }) => `${name}`}
                >
                  {dataChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPieColor(entry.name)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h2 className="text-lg font-semibold mb-4">Acciones recientes</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-400">No hay registros recientes.</p>
            ) : (
              <ul className="text-sm text-gray-700 space-y-2">
                {logs.slice(0, 5).map((log) => {
                  const fechaFormateada = new Date(log.fecha).toLocaleDateString("es-CL", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  });

                  return (
                    <li key={log.id}>
                      <span className="text-[#111A3A] font-semibold">{fechaFormateada}</span> –{" "}
                      {log.usuario || "Usuario desconocido"} <span className="italic">{log.accion}</span> en{" "}
                      <span className="font-medium">{log.tabla_afectada}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Cumplimiento por sección */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cumplimiento por Sección</h2>

            <div className="mb-4">
              <p className="text-sm font-medium text-[#111A3A]">Equipos Críticos</p>
              <div className="w-full bg-gray-200 rounded h-3 mt-1 overflow-hidden">
                <div
                  className="h-3 rounded flex items-center justify-center text-[10px] font-semibold"
                  style={{
                    width: `${porcentaje(critico.firmadas, critico.total)}%`,
                    backgroundColor: '#FF7144',
                    color: '#FFFFFF'
                  }}
                >
                  Crítico
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{critico.firmadas} de {critico.total} firmadas</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#111A3A]">Equipos Relevantes</p>
              <div className="w-full bg-gray-200 rounded h-3 mt-1 overflow-hidden">
                <div
                  className="h-3 rounded flex items-center justify-center text-[10px] font-semibold"
                  style={{
                    width: `${porcentaje(relevante.firmadas, relevante.total)}%`,
                    backgroundColor: '#334ED8',
                    color: '#F0FF3D'
                  }}
                >
                  Relevante
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{relevante.firmadas} de {relevante.total} firmadas</p>
            </div>
          </div>
        </section>
      </div>

      {/* Columna lateral: calendario */}
      <aside className="block">
        <MiniCalendar />
      </aside>
    </div>
  );
}

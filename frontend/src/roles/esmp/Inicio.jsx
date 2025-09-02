import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, Bell } from "lucide-react";
import KpiCard from "../../components/KpiCard.jsx";
import MiniCalendar from "../../components/MiniCalendar.jsx";
import axios from "axios";

export default function InicioESMP() {
  const [resumen, setResumen] = useState({ total: 0, completadas: 0, pendientes: 0 });
  const [criticosRetraso] = useState(0);
  const [alertas] = useState(0);

  useEffect(() => {
    document.title = "Inicio - ESMP";

    const fetchResumen = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/resumen`);
        setResumen(data);
      } catch (err) {
        console.error("❌ Error al obtener resumen:", err);
      }
    };

    fetchResumen();
  }, []);

  const dataChart = [
    { name: "Completadas", value: resumen.completadas },
    { name: "Pendientes", value: resumen.pendientes }
  ];

  return (
    <div className="p-6 text-[#111A3A] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        {/* KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard value={criticosRetraso} label="Órdenes críticas con retraso" Icon={AlertTriangle} color="#DC2626" />
            <KpiCard value={alertas} label="Alertas por vencimiento" Icon={Bell} />
          </div>
        </section>

        {/* Gráfico */}
        <section className="mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cumplimiento mensual</h2>
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
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : "#DC2626"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Accesos directos */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Accesos directos</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/esmp/auditoria" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Auditoría
              </Link>
              <Link to="/esmp/lista-equipos" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                Lista de equipos
              </Link>
              <Link to="/esmp/planificacion" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                Planificación
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

import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";
import KpiCard from "../../components/KpiCard.jsx";
import MiniCalendar from "../../components/MiniCalendar";


export default function InicioAdmin() {
  const [resumen, setResumen] = useState({ total: 0, completadas: 0, pendientes: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Inicio - Administrador";
    const fetchResumen = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/resumen`);
        setResumen(data);
      } catch (err) {
        console.error("❌ Error al obtener KPIs:", err);
        setError("No se pudo cargar el resumen.");
      }
    };
    fetchResumen();
  }, []);

  const dataChart = [
    { name: "Completadas", value: resumen.completadas },
    { name: "Pendientes", value: resumen.pendientes }
  ];

  const colores = ["#34D399", "#FBBF24"];

  return (
    <div className="p-6 text-[#111A3A] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      {/* Columna principal (contenido del dashboard) */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
  
        {error && <p className="text-red-500 mb-4">{error}</p>}
  
        {/* Sección KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard value={resumen.total} label="Órdenes Totales" Icon={ClipboardList} />
            <KpiCard value={resumen.completadas} label="Completadas" Icon={CheckCircle} color="#34D399" />
            <KpiCard value={resumen.pendientes} label="Pendientes" Icon={Clock} color="#FBBF24" />
          </div>
        </section>
  
        {/* Sección de gráfico + acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Resumen Visual</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={40}
                  label
                >
                  {dataChart.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Acciones recientes</h2>
            <ul className="text-gray-600 list-disc pl-5 text-sm space-y-1">
              <li>Usuario técnico agregado</li>
              <li>Equipo Atlan XL ingresado</li>
              <li>Orden de mantenimiento programada</li>
            </ul>
          </div>
        </div>
  
        {/* Placeholder para cumplimiento por sección */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cumplimiento por Sección</h2>
            <p className="text-gray-500 text-sm">Pronto se mostrará el cumplimiento por criticidad.</p>
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
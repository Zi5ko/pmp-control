import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ClipboardList } from "lucide-react";
import KpiCard from "../../components/KpiCard.jsx";
import MiniCalendar from "../../components/MiniCalendar.jsx";
import axios from "axios";

export default function InicioResponsable() {
  const [resumen, setResumen] = useState({ total: 0, completadas: 0, pendientes: 0 });
  const [cumplimiento, setCumplimiento] = useState({ critico: { total: 0, firmadas: 0 }, relevante: { total: 0, firmadas: 0 } });

  useEffect(() => {
    document.title = "Inicio - Responsable Institucional";

    const fetchResumen = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/resumen`);
        setResumen(data);
      } catch (err) {
        console.error("❌ Error al obtener resumen:", err);
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
    fetchCumplimiento();
  }, []);

  const porcentaje = (parte, total) => (total === 0 ? 0 : Math.round((parte / total) * 100));
  const { critico, relevante } = cumplimiento;

  return (
    <div className="p-6 text-[#111A3A] grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        {/* KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">KPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard value={resumen.pendientes} label="Planificaciones por ejecutar" Icon={ClipboardList} />
            <KpiCard value={0} label="Alertas técnicas" Icon={AlertCircle} color="#DC2626" />
          </div>
        </section>

        {/* Cumplimiento */}
        <section className="mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cumplimiento por Criticidad</h2>
            <div className="mb-4">
              <p className="text-sm font-medium text-[#111A3A]">Equipos Críticos</p>
              <div className="w-full bg-gray-200 rounded h-3 mt-1">
                <div className="bg-green-500 h-3 rounded" style={{ width: `${porcentaje(critico.firmadas, critico.total)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{critico.firmadas} de {critico.total} firmadas</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#111A3A]">Equipos Relevantes</p>
              <div className="w-full bg-gray-200 rounded h-3 mt-1">
                <div className="bg-blue-500 h-3 rounded" style={{ width: `${porcentaje(relevante.firmadas, relevante.total)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{relevante.firmadas} de {relevante.total} firmadas</p>
            </div>
          </div>
        </section>

        {/* Accesos directos */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Accesos directos</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/responsable_institucional/asignar-ordenes" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Asignar órdenes
              </Link>
              <Link to="/responsable_institucional/planificacion" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                Planificación
              </Link>
              <Link to="/responsable_institucional/reportes" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                Reportes firmados
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

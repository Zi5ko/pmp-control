// src/pages/functions/Planificacion.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import MiniCalendar from "../../components/MiniCalendar";
import CalendarContainer from "../../components/calendar/CalendarContainer";

export default function Planificacion() {
  const [eventos, setEventos] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [recargando, setRecargando] = useState(false);

  const fetchEventos = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/proyeccion`);
      const eventosConvertidos = data.map((orden) => ({
        id: orden.equipo_id,
        title: `${orden.nombre} (Proyectado)`,
        start: new Date(orden.fecha),
        end: new Date(orden.fecha),
        allDay: true,
        criticidad: orden.criticidad || "media",
        estado: "proyectado",
        ubicacion: orden.ubicacion,
        plan: orden.plan,
      }));
      setEventos(eventosConvertidos);
    } catch (error) {
      console.error("❌ Error al cargar eventos:", error);
    }
  };

  const fetchFaltantes = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/faltantes`);
      setFaltantes(data);
    } catch (error) {
      console.error("❌ Error al cargar faltantes:", error);
    }
  };

  const programarEquipo = async (equipo_id, nombre) => {
    const confirmar = window.confirm(`¿Deseas programar el equipo "${nombre}" desde hoy?`);
    if (!confirmar) return;

    try {
      setRecargando(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/ordenes`, {
        equipo_id,
        fecha_programada: new Date().toISOString().slice(0, 10),
        estado: 'pendiente'
      });

      toast.success("Equipo programado con éxito ✅");
      await fetchFaltantes();
      await fetchEventos();
    } catch (error) {
      console.error("❌ Error al programar equipo:", error);
      toast.error("Error al programar equipo ❌");
    } finally {
      setRecargando(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchFaltantes();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6">
      {/* PANEL IZQUIERDO */}
      <div className="w-full lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
        {/* Mini calendario */}
        <div>
          <MiniCalendar />
        </div>

        {/* Filtros */}
        <div className="bg-[#EFF3FA] rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-2 text-[#111A3A]">Tareas</h3>
          <ul className="space-y-2 text-sm text-[#111A3A]">
            <li><input type="checkbox" defaultChecked /> Mantenimientos</li>
            <li><input type="checkbox" /> Reuniones</li>
            <li><input type="checkbox" /> Revisiones</li>
          </ul>
        </div>

        {/* Equipos faltantes */}
        {faltantes.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-yellow-800 mb-2">Equipos sin programación</h2>
            <ul className="text-xs space-y-2">
              {faltantes.map((eq) => (
                <li key={eq.equipo_id} className="flex justify-between items-center">
                  <span>{eq.nombre}</span>
                  <button
                    onClick={() => programarEquipo(eq.equipo_id, eq.nombre)}
                    disabled={recargando}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-2 py-0.5 rounded"
                  >
                    Programar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CALENDARIO PRINCIPAL */}
      <div className="w-full order-1 lg:order-2">
        <CalendarContainer eventos={eventos} />
      </div>
    </div>
  );
}
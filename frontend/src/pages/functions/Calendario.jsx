// src/pages/functions/Calendario.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import MiniCalendar from "../../components/MiniCalendar";
import CalendarContainer from "../../components/calendar/CalendarContainer";

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [filtrosCriticidad, setFiltrosCriticidad] = useState({
    crítico: true,
    relevante: true,
    instalación: true
  });

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/ordenes/eventos`,
        config
      );

      const eventosConvertidos = data.map((evento) => ({
        id: evento.id?.toString() || `p-${evento.equipo_id}-${evento.start}`,
        title: evento.title,
        start: new Date(evento.start),
        end: new Date(evento.end),
        allDay: true,
        criticidad: evento.criticidad || "media",
        estado: evento.estado || "proyectado",
        tipo: evento.tipo || "proyectado",
        serie: evento.serie || "-",
        plan: evento.plan || "-",
        ubicacion: evento.ubicacion || "-",
        responsable: evento.responsable || null,
        equipo_id: evento.equipo_id
      }));

      setEventos(eventosConvertidos);
    } catch (error) {
      console.error("❌ Error al cargar eventos:", error);
    }
  };

  const aplicarFiltroCriticidad = () => {
    const activos = Object.keys(filtrosCriticidad).filter((c) => filtrosCriticidad[c]);
    const filtrados = eventos.filter((ev) => activos.includes(ev.criticidad));
    setEventosFiltrados(filtrados);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  useEffect(() => {
    aplicarFiltroCriticidad();
  }, [eventos, filtrosCriticidad]);

  const toggleCriticidad = (tipo) => {
    setFiltrosCriticidad((prev) => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6">
      {/* Panel izquierdo */}
      <div className="w-full lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
        <MiniCalendar />

        <div className="bg-[#5C7BA1] rounded-xl shadow p-4 text-white">
          <h3 className="text-sm font-semibold mb-2">Filtro de criticidad</h3>
          <ul className="space-y-2 text-sm">
            {["crítico", "relevante", "instalación"].map((tipo) => (
              <li key={tipo}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filtrosCriticidad[tipo]}
                    onChange={() => toggleCriticidad(tipo)}
                    className="mr-2 accent-white"
                  />
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Calendario principal */}
      <div className="w-full order-1 lg:order-2">
        <CalendarContainer eventos={eventosFiltrados} />
      </div>
    </div>
  );
}


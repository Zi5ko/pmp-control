// src/components/CalendarContainer.jsx
import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import WeekDayHeader from "./WeekDayHeader";
import MonthHeader from "./MonthHeader";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import EventModal from "./EventModal";
import { addDays, subDays, addMonths, subMonths } from "date-fns";

export default function CalendarContainer({ eventos }) {
  const [vista, setVista] = useState("semana"); // semana o mes
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const handleEventClick = (evento) => {
    setEventoSeleccionado(evento);
  };

  const cerrarModal = () => {
    setEventoSeleccionado(null);
  };

  const avanzar = () => {
    setFechaActual((prev) =>
      vista === "semana" ? addDays(prev, 7) : addMonths(prev, 1)
    );
  };

  const retroceder = () => {
    setFechaActual((prev) =>
      vista === "semana" ? subDays(prev, 7) : subMonths(prev, 1)
    );
  };

  const irAFechaActual = () => {
    setFechaActual(new Date());
  };

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 min-h-[700px]">
      {/* Botones de cambio de vista + hoy */}
      <CalendarHeader
        vista={vista}
        setVista={setVista}
        fechaActual={fechaActual}
        avanzar={avanzar}
        retroceder={retroceder}
        irAFechaActual={irAFechaActual}
      />

      {/* Encabezado según vista */}
      {vista === "semana" && (
        <WeekDayHeader
          fechaActual={fechaActual}
          avanzar={avanzar}
          retroceder={retroceder}
        />
      )}

      {vista === "mes" && (
        <MonthHeader
          fechaActual={fechaActual}
          avanzar={avanzar}
          retroceder={retroceder}
        />
      )}

      {/* Visualización del calendario */}
      <div className="mt-4">
        {vista === "semana" ? (
          <WeekView
            fechaActual={fechaActual}
            eventos={eventos}
            onEventClick={handleEventClick}
          />
        ) : (
          <MonthView
            fechaActual={fechaActual}
            eventos={eventos}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Modal de detalle */}
      {eventoSeleccionado && (
        <EventModal evento={eventoSeleccionado} onClose={cerrarModal} />
      )}
    </div>
  );
}
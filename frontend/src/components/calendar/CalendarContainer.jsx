// src/components/CalendarContainer.jsx
import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import WeekDayHeader from "./WeekDayHeader";
import MonthHeader from "./MonthHeader";
import DayHeader from "./DayHeader";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import DayView from "./DayView";
import EventModal from "./EventModal"; // o ajusta la ruta si está en otra carpeta
import { addDays, subDays, addMonths, subMonths } from "date-fns";

export default function CalendarContainer({ eventos }) {
  const [vista, setVista] = useState("semana");
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const handleEventClick = (evento) => {
    setEventoSeleccionado(evento);
  };

  const cerrarModal = () => {
    setEventoSeleccionado(null);
  };

  const avanzar = () => {
    if (vista === "semana") setFechaActual((prev) => addDays(prev, 7));
    else if (vista === "dia") setFechaActual((prev) => addDays(prev, 1));
    else if (vista === "mes") setFechaActual((prev) => addMonths(prev, 1));
  };

  const retroceder = () => {
    if (vista === "semana") setFechaActual((prev) => subDays(prev, 7));
    else if (vista === "dia") setFechaActual((prev) => subDays(prev, 1));
    else if (vista === "mes") setFechaActual((prev) => subMonths(prev, 1));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 min-h-[700px]">
      {/* Botones de cambio de vista */}
      <CalendarHeader
        vista={vista}
        setVista={setVista}
        fechaActual={fechaActual}
        avanzar={avanzar}
        retroceder={retroceder}
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

      {vista === "dia" && (
        <DayHeader
          fechaActual={fechaActual}
          avanzar={avanzar}
          retroceder={retroceder}
        />
      )}

      {/* Visualización del calendario */}
      <div className="mt-4">
        {vista === "semana" && (
          <WeekView
            fechaActual={fechaActual}
            eventos={eventos}
            onEventClick={handleEventClick}
          />
        )}
        {vista === "mes" && (
          <MonthView
            fechaActual={fechaActual}
            eventos={eventos}
            onEventClick={handleEventClick}
          />
        )}
        {vista === "dia" && (
          <DayView
            fechaActual={fechaActual}
            eventos={eventos}
            onEventClick={handleEventClick}
          />
        )}
      </div>
      {eventoSeleccionado && (
        <EventModal evento={eventoSeleccionado} onClose={cerrarModal} />
      )}
    </div>
  );
}
// src/components/calendar/WeekView.jsx
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export default function WeekView({ fechaActual, eventos, onEventClick }) {
  const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 });

  return (
    <div className="grid grid-cols-7 gap-1 mt-2">
      {[...Array(7)].map((_, i) => {
        const dia = addDays(inicioSemana, i);
        const esHoy = isToday(dia);
        const eventosDelDia = eventos.filter((ev) =>
          isSameDay(new Date(ev.start), dia)
        );

        return (
          <div
            key={i}
            className={`relative min-h-[128px] rounded-lg border p-2 bg-white flex flex-col ${
              esHoy ? "border-[#D0FF34]" : "border-gray-200"
            }`}
          >
            {/* Número del día en esquina superior izquierda */}
            <div
              className={`absolute top-2 left-2 text-sm font-bold ${
                esHoy ? "text-[#111A3A]" : "text-gray-700"
              }`}
            >
              {format(dia, "d", { locale: es })}
            </div>

            {/* Eventos del día */}
            <div className="mt-6 space-y-1 text-xs">
              {eventosDelDia.length > 0 ? (
                eventosDelDia.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => onEventClick(ev)}
                    className="rounded px-2 py-1 cursor-pointer"
                    style={{
                      backgroundColor:
                        ev.criticidad === "alta"
                          ? "#F87171"
                          : ev.criticidad === "media"
                          ? "#FACC15"
                          : "#60A5FA",
                      color: "#111A3A",
                    }}
                  >
                    {ev.title}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400">Sin tareas</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
// src/components/calendar/DayView.jsx
import { addDays, format, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";

export default function DayView({ fechaActual, eventos, onEventClick }) {
  const dias = [-1, 0, 1]; // Día anterior, actual, siguiente

  return (
    <div className="grid grid-cols-3 gap-2">
      {dias.map((offset) => {
        const dia = addDays(fechaActual, offset);
        const eventosDelDia = eventos.filter((ev) =>
          isSameDay(new Date(ev.start), dia)
        );

        const esHoy = isToday(dia);
        const titulo = format(dia, "EEEE dd MMMM", { locale: es });

        return (
          <div
            key={offset}
            className={`rounded-lg p-3 border bg-white min-h-[120px] ${
              esHoy ? "border-[#D0FF34]" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-sm font-bold mb-2 capitalize ${
                esHoy ? "text-[#111A3A]" : "text-gray-700"
              }`}
            >
              {titulo}
            </h3>

            {eventosDelDia.length > 0 ? (
              eventosDelDia.map((ev, idx) => (
                <div
                  key={idx}
                  className="text-xs mb-1 px-2 py-1 rounded cursor-pointer"
                  onClick={() => onEventClick(ev)}
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
              <p className="text-xs text-gray-400">Sin tareas</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
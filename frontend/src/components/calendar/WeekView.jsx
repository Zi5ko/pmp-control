//frontend/src/components/calendar/WeekView.jsx
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
            <div className="absolute top-2 left-2">
            {esHoy ? (
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D0FF34] text-[#111A3A] text-sm font-bold">
                {format(dia, "d", { locale: es })}
              </div>
            ) : (
              <div className="text-sm font-bold text-gray-700">
                {format(dia, "d", { locale: es })}
              </div>
            )}
          </div>

            {/* Eventos del día */}
            <div className="mt-8 space-y-1 text-xs">
              {eventosDelDia.length > 0 ? (
                eventosDelDia.map((ev, idx) => {
                  const crit = String(ev.criticidad || "")
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/\p{Diacritic}/gu, "");
                  return (
                  <div
                    key={ev.id || idx}
                    onClick={() => onEventClick(ev)}
                    title={ev.title}
                    className={`rounded px-2 py-1 cursor-pointer text-xs leading-snug line-clamp-3 break-words overflow-hidden ${
                      crit === "critico"
                        ? "bg-[#FF7144] text-white"
                        : crit === "relevante"
                        ? "bg-[#334ED8] text-[#F0FF3D]"
                        : crit.includes("instalacion")
                        ? "bg-[#D8E6FF] text-[#19123D]"
                        : "bg-[#C4C4C4] text-black"
                    }`}
                  >
                    <span title={ev.title}>
                      ID{String(ev.equipo_id).padStart(4, '0')} - {ev.title}
                    </span>
                  </div>
                )})
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

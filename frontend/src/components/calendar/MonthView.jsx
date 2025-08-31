//frontend/src/components/calendar/MonthView.jsx
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale";

export default function MonthView({ fechaActual, eventos, onEventClick }) {
  const inicioMes = startOfMonth(fechaActual);
  const finMes = endOfMonth(fechaActual);
  const inicioCuadro = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finCuadro = endOfWeek(finMes, { weekStartsOn: 1 });

  const hoy = new Date();

  const dias = [];
  let dia = inicioCuadro;

  while (dia <= finCuadro) {
    dias.push(dia);
    dia = addDays(dia, 1);
  }

  return (
    <div className="grid grid-cols-7 gap-1 mt-4">
      {dias.map((d, idx) => {
        const esHoy = isSameDay(d, hoy);
        const estaEnMes = isSameMonth(d, fechaActual);

        return (
          <div
            key={idx}
            className={`min-h-[128px] rounded-lg p-2 text-xs flex flex-col transition-all duration-150 border ${
              !estaEnMes
                ? "bg-gray-100 text-gray-400 border-gray-200"
                : esHoy
                ? "bg-white text-gray-900 border-[#D0FF34]"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {/* Número del día */}
            <div className="font-semibold mb-1">
              {esHoy ? (
                <span className="inline-block w-6 h-6 bg-[#D0FF34] text-black rounded-full text-center leading-6">
                  {format(d, "d", { locale: es })}
                </span>
              ) : (
                format(d, "d", { locale: es })
              )}
            </div>

            {/* Eventos del día */}
            <div className="line-clamp-2">
              {eventos
                .filter((ev) => isSameDay(new Date(ev.start), d))
                .map((ev, i) => (
                  <div
                    key={idx}
                    onClick={() => onEventClick(ev)}
                    title={ev.title}
                    className={`rounded px-2 py-1 cursor-pointer text-xs leading-snug line-clamp-3 break-words overflow-hidden ${
                      ev.criticidad === "crítico"
                        ? "bg-[#E01D00] text-white"
                        : ev.criticidad === "relevante"
                        ? "bg-[#FFC700] text-black"
                        : "bg-[#C4C4C4] text-black"
                    }`}
                  >
                    <span title={ev.title}>
                      ID{String(ev.equipo_id).padStart(4, '0')} - {ev.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
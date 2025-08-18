// src/components/calendar/MonthView.jsx
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

  const dias = [];
  let dia = inicioCuadro;

  while (dia <= finCuadro) {
    dias.push(dia);
    dia = addDays(dia, 1);
  }

  return (
    <div className="grid grid-cols-7 gap-1 mt-4">
      {dias.map((d, idx) => (
        <div
          key={idx}
          className={`min-h-[128px] border rounded-lg p-2 text-xs flex flex-col ${
            !isSameMonth(d, fechaActual)
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700"
          }`}
        >
          <div className="font-semibold mb-1">{format(d, "d", { locale: es })}</div>

          <div className="space-y-1">
            {eventos
              .filter((ev) => isSameDay(new Date(ev.start), d))
              .map((ev, i) => (
                <div
                  key={i}
                  onClick={() => onEventClick(ev)}
                  className={`cursor-pointer rounded px-2 py-1 ${
                    ev.criticidad === "alta"
                      ? "bg-red-300"
                      : ev.criticidad === "media"
                      ? "bg-yellow-300"
                      : "bg-blue-300"
                  }`}
                >
                  {ev.title}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
// src/components/calendar/WeekDayHeader.jsx
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export default function WeekDayHeader({ fechaActual, avanzar, retroceder }) {
  const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 });
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

  return (
    <div className="flex items-center justify-between gap-2 my-4">
      {/* Botón retroceder */}
      <button
        onClick={retroceder}
        className="h-[60px] w-[40px] bg-[#D0FF34] text-[#111A3A] font-bold rounded-xl shadow-sm text-lg"
      >
        &#60;
      </button>

      {/* Días de la semana */}
      <div className="flex-1 flex justify-between">
        {diasSemana.map((dia, i) => {
          const esHoy = isSameDay(dia, new Date());
          return (
            <div
              key={i}
              className={`flex flex-col justify-center px-4 py-2 rounded-xl w-[100px] text-sm font-semibold text-center shadow-sm ${
                esHoy
                  ? "bg-[#D0FF34] text-[#111A3A]"
                  : "bg-white border border-gray-200 text-gray-700"
              }`}
            >
              <span className="capitalize leading-tight">{format(dia, "EEEE", { locale: es })}</span>
              <span className="text-base">{format(dia, "dd", { locale: es })}</span>
            </div>
          );
        })}
      </div>

      {/* Botón avanzar */}
      <button
        onClick={avanzar}
        className="h-[60px] w-[40px] bg-[#D0FF34] text-[#111A3A] font-bold rounded-xl shadow-sm text-lg"
      >
        &#62;
      </button>
    </div>
  );
}
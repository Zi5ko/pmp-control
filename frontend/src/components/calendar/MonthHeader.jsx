// src/components/calendar/MonthHeader.jsx
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MonthHeader({ fechaActual, avanzar, retroceder }) {
  const titulo = format(fechaActual, "MMMM", { locale: es });

  return (
    <div className="flex items-center gap-2 my-4">
      {/* Botón retroceder */}
      <button
        onClick={retroceder}
        className="h-[60px] w-[40px] bg-[#D0FF34] text-[#111A3A] font-bold rounded-xl shadow-sm text-lg"
      >
        &#60;
      </button>

      {/* Contenedor del mes extendido */}
      <div className="flex-1">
        <div className="w-full h-[60px] flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-lg font-bold capitalize text-[#111A3A]">
            {titulo}
          </span>
        </div>
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
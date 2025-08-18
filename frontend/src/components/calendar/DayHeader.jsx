// src/components/DayHeader.jsx
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DayHeader({ fechaActual, retroceder, avanzar }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={retroceder} className="text-xl text-[#111A3A] font-bold">&lt;</button>
      <h2 className="text-lg font-bold capitalize text-[#111A3A]">
        {format(fechaActual, "EEEE dd MMMM yyyy", { locale: es })}
      </h2>
      <button onClick={avanzar} className="text-xl text-[#111A3A] font-bold">&gt;</button>
    </div>
  );
}
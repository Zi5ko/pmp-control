import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CalendarHeader({ vista, setVista, fechaActual }) {
  const mes = vista === "mes"
    ? format(fechaActual, "yyyy", { locale: es }) // Vista de mes: mostrar año
    : format(fechaActual, "MMMM yyyy", { locale: es }); // Vista de semana o día: mostrar mes y año

  return (
    <div className="flex justify-between items-center px-2 mb-4">
      {/* Nombre del mes */}
      <h2 className="text-xl font-bold text-[#111A3A] capitalize">{mes}</h2>

      {/* Selector de vista */}
      <div className="flex bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm">
        {["mes", "semana", "dia"].map((tipo, idx) => (
          <button
            key={idx}
            onClick={() => setVista(tipo)}
            className={`px-4 py-1 text-sm font-semibold transition-all duration-200 ${
              vista === tipo
                ? "bg-[#D0FF34] text-[#111A3A]"
                : "text-gray-600 hover:text-[#111A3A]"
            }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
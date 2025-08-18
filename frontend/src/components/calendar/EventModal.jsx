export default function EventModal({ evento, onClose }) {
    if (!evento) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
          <button
            className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-lg font-bold mb-4 text-[#111A3A]">Detalle del mantenimiento</h2>
          <ul className="text-sm space-y-2">
            <li><strong>Equipo:</strong> {evento.title}</li>
            <li><strong>Fecha:</strong> {evento.start.toLocaleDateString("es-CL")}</li>
            <li><strong>Criticidad:</strong> {evento.criticidad || "media"}</li>
            <li><strong>Tipo:</strong> {evento.real ? "Real" : "Proyectado"}</li>
          </ul>
        </div>
      </div>
    );
  }
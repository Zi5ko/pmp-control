// src/components/ordenes/DetalleOrdenModal.jsx
import { XCircle } from "lucide-react";

export default function DetalleOrdenModal({ orden, evidencias = [], onClose }) {
  if (!orden) return null;
  const baseUrl = import.meta.env.VITE_API_URL;
  const observacion = orden.observaciones?.observaciones || "Sin observaciones";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-[#111A3A] hover:text-gray-600"
          onClick={onClose}
        >
          <XCircle size={20} />
        </button>

        <h2 className="text-lg font-bold text-[#111A3A] mb-4">Detalle de la OT</h2>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-[#111A3A] mb-1">Observaciones</h3>
            <p className="whitespace-pre-line">{observacion}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#111A3A] mb-1">Evidencias</h3>
            {evidencias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {evidencias.map((ev, idx) => {
                  const yaTieneCarpeta =
                    ev.url?.includes("reportes/") || ev.url?.includes("evidencias/");
                  const carpeta =
                    ev.tipo === "reporte_firmado" ? "reportes" : "evidencias";
                  const rutaFinal = yaTieneCarpeta ? ev.url : `${carpeta}/${ev.url}`;
                  const sanitized = rutaFinal
                    .replace(/^\\/, "")
                    .replace(/^uploads[\\/]/, "");
                  return (
                    <a
                      key={idx}
                      href={`${baseUrl}/uploads/${sanitized}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#D0FF34] text-[#111A3A] px-4 py-1 rounded-full text-xs font-semibold hover:bg-lime-300"
                    >
                      {ev.etiqueta || `Evidencia ${idx + 1}`}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Sin evidencias</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

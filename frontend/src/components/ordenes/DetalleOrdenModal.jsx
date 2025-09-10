// src/components/ordenes/DetalleOrdenModal.jsx
import { XCircle, ListChecks, User, UserCheck, FileUp } from "lucide-react";

export default function DetalleOrdenModal({ orden, evidencias = [], onClose }) {
  if (!orden) return null;
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const limpiarTexto = (valor, defecto) => {
    if (!valor) return defecto;
    if (Array.isArray(valor)) {
      const texto = valor
        .map((v) => (typeof v === "string" ? v : v?.descripcion || v?.tarea || ""))
        .filter(Boolean)
        .join("\n")
        .trim();
      return texto || defecto;
    }
    return String(valor).trim() || defecto;
  };

  let tareas = "Sin tareas registradas";
  let observacion = "Sin observaciones";
  let comentarioSupervisor = "Sin comentarios del supervisor";
  const obs = orden.observaciones;

  if (obs) {
    if (typeof obs === "object") {
      tareas = limpiarTexto(obs.tareas, tareas);
      observacion = limpiarTexto(obs.observaciones, observacion);
      comentarioSupervisor = limpiarTexto(
        obs.comentarios_supervisor,
        comentarioSupervisor
      );
    } else {
      const tareasMatch = obs.match(/Tareas realizadas:\n([\s\S]*?)\n\nObservaciones:/);
      const observacionesMatch = obs.match(/Observaciones:\n([\s\S]*?)(?:\n\nComentarios del supervisor:|$)/);
      const comentariosMatch = obs.match(/Comentarios del supervisor:\n([\s\S]*)/);
      if (tareasMatch) tareas = tareasMatch[1].trim();
      if (observacionesMatch) observacion = observacionesMatch[1].trim();
      if (comentariosMatch) comentarioSupervisor = comentariosMatch[1].trim();
    }
  }

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
          <div className="rounded-xl border p-3 bg-[#BADDCF] border-[#19123D]">
            <h3 className="font-semibold text-[#111A3A] mb-1 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#19123D]" />
              Tareas realizadas
            </h3>
            <p className="whitespace-pre-line text-gray-800">{tareas}</p>
          </div>

          <div className="rounded-xl border p-3 bg-[#E8F3DA] border-[#19123D]">
            <h3 className="font-semibold text-[#111A3A] mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-[#19123D]" />
              Observaciones del técnico
            </h3>
            <p className="whitespace-pre-line text-gray-800">{observacion}</p>
          </div>

          <div className="rounded-xl border p-3 bg-[#6787AF] border-[#19123D]">
            <div className="flex items-start gap-2 text-white">
              <UserCheck className="w-4 h-4 text-white mt-0.5" />
              <div>
                <div className="font-semibold">Observación del supervisor</div>
                <p className="whitespace-pre-line">{comentarioSupervisor}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#111A3A] mb-1 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-[#111A3A]" />
              Evidencias
            </h3>
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

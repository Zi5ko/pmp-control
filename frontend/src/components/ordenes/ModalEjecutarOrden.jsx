// src/components/ordenes/ModalEjecutarOrden.jsx
import { useState, useEffect } from "react";
import {
  Tag,
  MapPin,
  Cpu,
  QrCode,
  User,
  UserCheck,
  ListChecks,
  FileUp,
  XCircle,
  Hash,
} from "lucide-react";
import axios from "axios";
import { getEvidenciasPorOrden, deleteEvidencia } from "../../services/evidenciasService";

export default function ModalEjecutarOrden({
  ordenId,
  equipoId,
  equipoSerie,
  equipoNombre,
  equipoUbicacion,
  observacionesPrevias,
  onClose,
  onSuccess
}) {
  const [tareas, setTareas] = useState(observacionesPrevias?.tareas || "");
  const [observaciones, setObservaciones] = useState(
    observacionesPrevias?.observaciones || ""
  );
  const [archivos, setArchivos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    setTareas(observacionesPrevias?.tareas || "");
    setObservaciones(observacionesPrevias?.observaciones || "");
    const cargarEvidencias = async () => {
      try {
        const data = await getEvidenciasPorOrden(ordenId);
        setEvidencias(data);
      } catch (e) {
        console.error("Error cargando evidencias:", e);
      }
    };
    if (ordenId) cargarEvidencias();
  }, [observacionesPrevias, ordenId]);

  const handleArchivoChange = (e) => {
    setArchivos(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    setSubiendo(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Subir archivos
      for (const file of archivos) {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("orden_id", ordenId);
        formData.append("tipo", file.type);

        await axios.post(`${import.meta.env.VITE_API_URL}/evidencias`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      // refrescar evidencias subidas
      try {
        const data = await getEvidenciasPorOrden(ordenId);
        setEvidencias(data);
      } catch {}

      await axios.put(
        `${import.meta.env.VITE_API_URL}/ordenes/${ordenId}/ejecutar`,
        { observaciones: { tareas, observaciones } },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess();
      onClose();

    } catch (err) {
      console.error("❌ Error al ejecutar orden:", err);
      setError("Ocurrió un error al ejecutar la orden.");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarEvidencia = async (id) => {
    try {
      await deleteEvidencia(id);
      setEvidencias((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("No se pudo eliminar la evidencia", e);
      setError("No se pudo eliminar la evidencia");
      setTimeout(() => setError(null), 2000);
    }
  };

  const formatearCodigo = (prefijo, id) => `${prefijo}${String(id).padStart(4, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-left">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-[#111A3A]">
            Registro de Mantenimiento
          </h2>
          <span className="inline-flex items-center rounded-full bg-[#19123D] text-white text-xs font-semibold px-3 py-1 select-none">
            <Hash className="w-3.5 h-3.5 mr-1" />
            {formatearCodigo("OT", ordenId)}
          </span>
        </div>
        
        {/* Encabezado con info del equipo */}
        <div className="flex flex-col gap-3 mb-6 mt-4">
          <div className="text-base text-[#111A3A] font-semibold">
            {equipoNombre}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Tag className="w-4 h-4 text-[#111A3A]" />
              <span><strong>ID Equipo:</strong> {formatearCodigo("ID", equipoId)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <QrCode className="w-4 h-4 text-[#111A3A]" />
              <span><strong>Serie:</strong> {equipoSerie || "No especificada"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-[#111A3A]" />
              <span><strong>Ubicación:</strong> {equipoUbicacion || "No especificada"}</span>
            </div>
          </div>
          
          {observacionesPrevias?.comentarios_supervisor !== undefined && (
            <div className="mt-2 rounded-xl border border-[#19123D] bg-[#6787AF] p-3">
              <div className="flex items-start gap-2 text-sm text-white">
                <UserCheck className="w-4 h-4 text-white mt-0.5" />
                <div>
                  <div className="font-semibold">Observación del supervisor</div>
                  <div className="whitespace-pre-line">
                    {observacionesPrevias.comentarios_supervisor || "Sin comentarios"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-[#111A3A]" />
            Tareas realizadas
          </label>
          <textarea
            value={tareas}
            onChange={(e) => setTareas(e.target.value)}
            placeholder="Escriba con detalles las tareas realizadas"
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-[#111A3A]" />
            Observaciones del técnico
          </label>
          <input
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escriba sus observaciones"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Subir evidencia */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-[#111A3A]" />
                Subir evidencia
              </label>
              <input
                type="file"
                multiple
                onChange={handleArchivoChange}
                className="text-sm mb-1"
              />
              <p className="text-xs text-gray-500">.PDF, .JPG, .PNG, .DOCX</p>
            </div>

            {/* Evidencias existentes */}
            {evidencias?.length > 0 && (
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Evidencias cargadas</div>
                <ul className="flex flex-wrap gap-2">
                  {evidencias.map((ev) => {
                    const yaTieneCarpeta = ev.url?.includes("reportes/") || ev.url?.includes("evidencias/");
                    const rutaFinal = yaTieneCarpeta ? ev.url : `evidencias/${ev.url}`;
                    const sanitized = rutaFinal.replace(/^\\\\?/, '').replace(/^uploads[\\/]/, '').replace(/^\//, '');
                    const nombre = (ev.url || '').split('/').pop();
                    return (
                      <li key={ev.id} className="flex items-center gap-2">
                        <a
                          href={`${baseUrl}/uploads/${sanitized}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#D0FF34] text-[#111A3A] font-semibold text-xs px-3 py-1 rounded-full shadow hover:bg-lime-300 max-w-[200px] truncate"
                          title={nombre}
                        >
                          {nombre}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleEliminarEvidencia(ev.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title="Eliminar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm font-medium text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={subiendo}
            className="px-6 py-2 bg-[#D0FF34] text-[#111A3A] font-semibold rounded hover:bg-lime-300 text-sm"
          >
            {subiendo ? "Enviando..." : "Enviar para Revisión"}
          </button>
        </div>
      </div>
    </div>
  );
}

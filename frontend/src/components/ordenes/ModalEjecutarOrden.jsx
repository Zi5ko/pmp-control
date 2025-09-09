// src/components/ordenes/ModalEjecutarOrden.jsx
import { useState, useEffect } from "react";
import { Tag, MapPin, SquarePlus } from "lucide-react";
import axios from "axios";

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

  useEffect(() => {
    setTareas(observacionesPrevias?.tareas || "");
    setObservaciones(observacionesPrevias?.observaciones || "");
  }, [observacionesPrevias]);

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

  const formatearCodigo = (prefijo, id) => `${prefijo}${String(id).padStart(4, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-left">
        <h2 className="text-xl font-bold text-[#111A3A] mb-1">
          Registro de Mantenimiento
        </h2>
        
        {/* Encabezado con info del equipo */}
        <div className="flex flex-col gap-2 mb-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Tag className="w-4 h-4 text-[#111A3A]" />
            <span><strong>ID:</strong> {formatearCodigo("ID", equipoId)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Tag className="w-4 h-4 text-[#111A3A]" />
            <span><strong>OT:</strong> {formatearCodigo("OT", ordenId)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <SquarePlus className="w-4 h-4 text-[#111A3A]" />
            <span><strong>Equipo:</strong> {equipoNombre}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Tag className="w-4 h-4 text-[#111A3A]" />
            <span><strong>Serie:</strong> {equipoSerie || "No especificada"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-[#111A3A]" />
            <span><strong>Ubicación:</strong> {equipoUbicacion || "No especificada"}</span>
          </div>
          {observacionesPrevias?.comentarios_supervisor !== undefined && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Tag className="w-4 h-4 text-[#111A3A]" />
              <span>
                <strong>Comentario del supervisor:</strong>{" "}
                {observacionesPrevias.comentarios_supervisor ||
                  "Sin comentarios"}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tareas Realizadas
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
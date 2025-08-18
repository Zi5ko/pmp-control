// src/components/ordenes/ModalEjecutarOrden.jsx
import { useState } from "react";
import axios from "axios";

export default function ModalEjecutarOrden({ ordenId, onClose, onSuccess }) {
  const [archivos, setArchivos] = useState([]);
  const [comentario, setComentario] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const handleArchivoChange = (e) => {
    setArchivos(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    setSubiendo(true);
    try {
      const token = localStorage.getItem("token");

      // Subir cada archivo
      for (const file of archivos) {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("orden_id", ordenId);
        formData.append("tipo", file.type);

        await axios.post("http://localhost:3000/api/evidencias", formData,  {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Ejecutar la orden (marcar como realizada)
      await axios.put(`http://localhost:3000/api/ordenes/${ordenId}/ejecutar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
      onSuccess();
      
    } catch (err) {
      console.error("Error al ejecutar orden:", err);
      alert("Ocurrió un error al ejecutar la orden.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold text-[#111A3A] mb-4">Ejecutar orden</h2>

        <label className="block text-sm font-semibold text-gray-600 mb-1">Evidencias (archivos)</label>
        <input
          type="file"
          multiple
          onChange={handleArchivoChange}
          className="mb-4 text-sm"
        />

        <label className="block text-sm font-semibold text-gray-600 mb-1">Comentarios (opcional)</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded p-2 text-sm mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-1 rounded border border-gray-300 text-gray-600">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={subiendo}
            className="text-sm px-4 py-1 rounded bg-[#D0FF34] text-[#111A3A] font-semibold"
          >
            {subiendo ? "Subiendo..." : "Ejecutar"}
          </button>
        </div>
      </div>
    </div>
  );
}
//frontend/src/pages/functions/HistorialTécnico.jsx
import { useEffect, useState } from "react";
import { getHistorialOrdenes } from "../../services/ordenesServices";
import { descargarReportePDF } from "../../services/reportesService";
import {
  FileText,
  Image,
  Video,
  AudioLines,
  Archive,
  Table,
  FileSignature,
  Download,
} from "lucide-react";

export default function HistorialTecnico() {
  const [ordenes, setOrdenes] = useState([]);

  const fetchOrdenes = async () => {
    try {
      const data = await getHistorialOrdenes();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const getFileIcon = (tipo) => {
    if (!tipo) return <FileText className="w-4 h-4" />;

    const t = tipo.toLowerCase();

    if (t.includes("pdf")) return <FileText className="w-4 h-4 text-red-600" />;
    if (t.includes("word") || t.includes("msword"))
      return <FileSignature className="w-4 h-4 text-blue-600" />;
    if (t.includes("excel") || t.includes("spreadsheet"))
      return <Table className="w-4 h-4 text-green-600" />;
    if (t.includes("image")) return <Image className="w-4 h-4 text-purple-600" />;
    if (t.includes("video")) return <Video className="w-4 h-4 text-indigo-600" />;
    if (t.includes("audio")) return <AudioLines className="w-4 h-4 text-yellow-600" />;
    if (t.includes("zip") || t.includes("rar")) return <Archive className="w-4 h-4 text-gray-600" />;

    return <FileText className="w-4 h-4" />;
  };

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const handleDescargarPDF = async (ordenId) => {
    try {
      const nombreArchivo = `reporte_orden_${ordenId}.pdf`;
      await descargarReportePDF(nombreArchivo);
    } catch (err) {
      alert("No se pudo descargar el PDF.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#111A3A] mb-4">Historial de mantenimientos ejecutados</h1>

      {ordenes.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron mantenimientos ejecutados.</p>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border rounded-lg p-4 bg-white shadow">
              <p className="text-sm text-gray-700">
                <strong>Equipo:</strong> {orden.equipo_nombre || "Sin nombre"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Ubicación:</strong> {orden.ubicacion || "No especificada"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Fecha ejecución:</strong> {orden.fecha_ejecucion?.slice(0, 10) || "No registrada"}
              </p>
              <p className={`text-sm font-semibold mt-2 ${
                orden.estado === 'validada' 
                  ? 'text-green-600' 
                  : orden.estado === 'realizada' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600'
                }`}>
                Estado: {orden.estado}
              </p>

              {orden.estado === "validada" && (
                <button
                  onClick={() => handleDescargarPDF(orden.id)}
                  className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Descargar PDF firmado
                </button>
              )}

              {orden.evidencias?.length > 0 ? (
                <div className="mt-2">
                  <p className="font-semibold text-sm mb-1">Evidencias:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {orden.evidencias.map((ev, idx) => {
                      const url = ev.url.startsWith("/") ? ev.url : `/${ev.url}`;
                      return (
                        <li key={idx} className="flex items-center gap-2">
                          <a
                            href={`${baseUrl}/uploads/${ev.url.replace(/^\/|^uploads\//, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {getFileIcon(ev.tipo)} Evidencia {idx + 1}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No se adjuntaron evidencias.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
//frontend/src/pages/functions/RegistrosFirmas.jsx
import { useEffect, useState } from "react";
import { getOrdenesValidadas, generarPDF, descargarReportePDF } from "../../services/reportesService";
import FirmaDibujo from "../../components/FirmaDibujo";
import { Download } from "lucide-react";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";

const formatearID = (id) => `ID${String(id).padStart(4, "0")}`;
const formatearOT = (id) => `OT${String(id).padStart(4, "0")}`;

export default function RegistrosYFirmas() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [firmaServicio, setFirmaServicio] = useState(null);
  const [firmaTecnico, setFirmaTecnico] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [archivoGenerado, setArchivoGenerado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesValidadas();
      setOrdenes(data);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setMensaje({ tipo: "error", texto: "Error al cargar órdenes validadas." });
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const generarReporte = async () => {
    if (!firmaServicio || !firmaTecnico || !ordenSeleccionada) {
      setMensaje({ tipo: "error", texto: "Debes completar ambas firmas para continuar." });
      return;
    }
  
    setGenerando(true);
  
    try {
      const pdfRespuesta = await generarPDF(ordenSeleccionada.id, {
        firmaServicio,
        firmaTecnico,
      });
  
      if (pdfRespuesta && pdfRespuesta.url) {
        setMensaje({ tipo: "success", texto: "Reporte generado correctamente." });
  
        // Mostrar el PDF en nueva pestaña
        const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        window.open(`${baseUrl}/uploads/${rutaFinal.replace(/^\/|^uploads\//, "")}`, "_blank");
  
        // Limpiar estados
        setFirmaServicio(null);
        setFirmaTecnico(null);
        setOrdenSeleccionada(null);
        setArchivoGenerado(null);
  
        // Esperar un poco antes de recargar (evita conflicto por retraso del backend)
        setTimeout(() => {
          fetchOrdenes();
        }, 300); // 300 ms es suficiente
      }
    } catch (error) {
      console.error("Error generando reporte:", error);
      setMensaje({ tipo: "error", texto: "Error al generar el reporte." });
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargar = () => {
    if (archivoGenerado) {
      descargarReportePDF(archivoGenerado);
    }
  };

  return (
    <div className="p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner title="Éxito" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner title="Error" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}

      <h1 className="text-2xl mb-6 text-[#111A3A]">Registros y Firmas</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Tabla de órdenes validadas */}
        <div className="bg-white border border-gray-200 rounded-xl shadow p-4 overflow-auto md:col-span-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Órdenes validadas</h2>
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">OT</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Equipo</th>
                <th className="px-4 py-2">Ubicación</th>
                <th className="px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  onClick={() => {
                    setOrdenSeleccionada(orden);
                    setArchivoGenerado(null);
                    setFirmaServicio(null);
                    setFirmaTecnico(null);
                  }}
                  className={`border-t cursor-pointer hover:bg-gray-100 ${
                    ordenSeleccionada?.id === orden.id ? "bg-blue-100" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-semibold">{formatearOT(orden.id)}</td>
                  <td className="px-4 py-2">{formatearID(orden.equipo_id)}</td>
                  <td className="px-4 py-2">{orden.equipo_nombre}</td>
                  <td className="px-4 py-2">{orden.ubicacion}</td>
                  <td className="px-4 py-2">{new Date(orden.fecha_ejecucion).toLocaleDateString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel de firma */}
        <div className="bg-white border border-gray-200 rounded-xl shadow p-6 md:col-span-2">
          {ordenSeleccionada ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Firmas del reporte</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Firma usuario servicio clínico</label>
                <FirmaDibujo onSave={setFirmaServicio} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Tu firma (técnico)</label>
                <FirmaDibujo onSave={setFirmaTecnico} />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={generarReporte}
                  disabled={generando}
                  className="bg-[#D0FF34] text-[#111A3A] font-semibold text-sm px-4 py-2 rounded shadow hover:bg-lime-300"
                >
                  {generando ? "Generando..." : "Generar reporte"}
                </button>

                {archivoGenerado && (
                  <button
                    onClick={handleDescargar}
                    className="bg-white border border-gray-300 text-sm text-gray-800 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-sm">Selecciona una orden de trabajo validada para firmar el reporte.</p>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { getHistorialOrdenes } from "../../services/ordenesServices";
import {
  FileText,
  Image,
  Video,
  AudioLines,
  Archive,
  Table,
  FileSignature,
} from "lucide-react";

export default function HistorialTecnico() {
  const [ordenes, setOrdenes] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("todas");

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
    if (t.includes("word") || t.includes("msword")) return <FileSignature className="w-4 h-4 text-blue-600" />;
    if (t.includes("excel") || t.includes("spreadsheet")) return <Table className="w-4 h-4 text-green-600" />;
    if (t.includes("image")) return <Image className="w-4 h-4 text-purple-600" />;
    if (t.includes("video")) return <Video className="w-4 h-4 text-indigo-600" />;
    if (t.includes("audio")) return <AudioLines className="w-4 h-4 text-yellow-600" />;
    if (t.includes("zip") || t.includes("rar")) return <Archive className="w-4 h-4 text-gray-600" />;
    return <FileText className="w-4 h-4" />;
  };

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const ordenesFiltradas = ordenes.filter((o) => {
    if (estadoFiltro === "todas") return true;
    return o.estado === estadoFiltro;
  });

  const estados = [
    { label: "Firmadas", value: "firmada" },
    { label: "Validadas", value: "validada" },
  ];

  return (
    <div className="p-6">
      {/* Encabezado + Filtro */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h1 className="text-2xl text-[#111A3A]">Historial de mantenimientos</h1>
        <div className="flex mt-4 md:mt-0 bg-white rounded-full overflow-hidden text-sm font-medium shadow-sm">
          {estados.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setEstadoFiltro(value)}
              className={`px-4 py-2 transition ${
                estadoFiltro === value
                  ? "bg-lime-400 text-[#111A3A] font-bold"
                  : "text-[#111A3A] hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setEstadoFiltro("todas")}
            className={`px-4 py-2 transition ${
              estadoFiltro === "todas"
                ? "bg-lime-400 text-[#111A3A] font-bold"
                : "text-[#111A3A] hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Resultados */}
      {ordenesFiltradas.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron mantenimientos ejecutados.</p>
      ) : (
        <div className="space-y-4">
          {ordenesFiltradas.map((orden) => {
            const otLabel = `OT${String(orden.id).padStart(4, "0")}`;
            const idEquipoLabel = `ID${String(orden.equipo_id).padStart(4, "0")}`;

            return (
              <div key={orden.id} className="relative bg-white rounded-2xl border p-8 shadow-sm flex flex-col gap-2">
                {/* Estado */}
                <span
                  className={`absolute top-6 right-8 px-4 py-1 rounded-md text-xs font-bold tracking-wide ${
                    orden.estado === "firmada"
                      ? "bg-indigo-600 text-white"
                      : orden.estado === "validada"
                      ? "bg-green-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {orden.estado.toUpperCase()}
                </span>

                {/* Nombre equipo */}
                <h2 className="text-lg md:text-xl font-extrabold text-[#111A3A]">{orden.equipo_nombre || "Equipo sin nombre"}</h2>

                {/* Responsable */}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {orden.estado === "firmada" ? "Firmado por:" : orden.estado === "validada" ? "Validado por:" : "Ejecutado por:"}
                  </span>{" "}
                  {orden.responsable || "—"}
                </p>

                {/* Datos adicionales */}
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  <p><strong>OT:</strong> {otLabel}</p>
                  <p><strong>Serie:</strong> {orden.serie || "No especificada"}</p>
                  <p><strong>Ubicación:</strong> {orden.ubicacion || "—"}</p>
                  <p><strong>Fecha ejecución:</strong> {orden.fecha_ejecucion?.slice(0, 10) || "No registrada"}</p>
                </div>

                {/* Botones de evidencias */}
                {orden.evidencias?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {orden.evidencias.map((ev, idx) => {
                      const yaTieneCarpeta = ev.url?.includes("reportes/") || ev.url?.includes("evidencias/");
                      const carpeta = ev.tipo === "reporte_firmado" ? "reportes" : "evidencias";
                      const rutaFinal = yaTieneCarpeta ? ev.url : `${carpeta}/${ev.url}`;
                      const etiqueta = ev.etiqueta || (ev.tipo === "reporte_firmado" ? "Reporte firmado" : `Evidencia ${idx + 1}`);

                      return (
                        <a
                          key={idx}
                          href={`${baseUrl}/uploads/${rutaFinal.replace(/^\/|^uploads\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-lime-400 hover:bg-lime-500 text-[#111A3A] px-4 py-1.5 rounded-full text-xs font-semibold transition"
                        >
                          {etiqueta}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
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
  Hash,
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

  // Colores de criticidad
  const getCriticidadClasses = (crit) => {
    if (!crit) return "bg-gray-300 text-[#19123D]";
    const key = crit.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (key.includes("critico")) return "bg-[#FF7144] text-white"; // Crítico: fondo FF7144, texto blanco
    if (key.startsWith("relevante") || key === "relevante") return "bg-[#334ED8] text-[#F0FF3D]"; // Relevante
    if (key.includes("instalacion")) return "bg-[#D8E6FF] text-[#19123D]"; // Instalaciones
    return "bg-gray-300 text-[#19123D]";
  };

  const ordenesFiltradas = ordenes
    .filter((o) => {
      if (estadoFiltro === "todas") return true;
      return o.estado === estadoFiltro;
    })
    .sort((a, b) => {
      const da = a?.fecha_ejecucion ? new Date(a.fecha_ejecucion) : new Date(0);
      const db = b?.fecha_ejecucion ? new Date(b.fecha_ejecucion) : new Date(0);
      return db - da;
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
        <div className="flex mt-4 md:mt-0 bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm">
          {estados.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setEstadoFiltro(value)}
              className={`px-4 py-1 text-sm font-semibold transition-all duration-200 ${
                estadoFiltro === value
                  ? "bg-[#D0FF34] text-[#111A3A]"
                  : "text-gray-600 hover:text-[#111A3A]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setEstadoFiltro("todas")}
            className="px-4 py-1 text-sm font-semibold bg-gray-100 text-[#111A3A] hover:bg-gray-200"
          >
            Todas
          </button>
        </div>
      </div>

      {/* Resultados */}
      {ordenesFiltradas.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron mantenimientos ejecutados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ordenesFiltradas.map((orden) => {
            const otLabel = `OT${String(orden.id).padStart(4, "0")}`;
            const idEquipoLabel = `ID${String(orden.equipo_id).padStart(4, "0")}`;

            return (
              <div key={orden.id} className="relative bg-[#EBECF0] rounded-2xl p-6 shadow-sm flex flex-col gap-2">
                {/* Flag/etiqueta de estado sobre el título */}
                <div className="mb-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide text-white ${
                      orden.estado === "firmada"
                        ? "bg-[#003D31] text-[#F0FF3D]"
                        : orden.estado === "validada"
                        ? "bg-[#273287] text-[#F0FF3D]"
                        : "bg-gray-500"
                    }`}
                  >
                    {orden.estado?.toUpperCase()}
                  </span>
                </div>
                {/* Número de orden (estilo modal ejecutar mantenimiento) */}
                <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[#19123D] text-white text-xs font-semibold px-3 py-1 select-none">
                  <Hash className="w-3.5 h-3.5 mr-1" />
                  {otLabel}
                </div>

                {/* Nombre del equipo */}
                <h2 className="text-base md:text-lg font-bold text-[#111A3A] pr-28">{orden.equipo_nombre || "Equipo sin nombre"}</h2>

                {/* Chips: Fecha de ejecución y Criticidad del equipo */}
                <div className="mt-1 flex flex-wrap gap-2 items-center">
                  <span className="inline-block rounded-full bg-[#6787AF] text-white text-xs font-semibold px-3 py-1">
                    {orden.fecha_ejecucion?.slice(0, 10) || "Fecha no registrada"}
                  </span>
                  {orden.criticidad && (
                    <span className={`inline-block rounded-full text-xs font-semibold px-3 py-1 ${getCriticidadClasses(orden.criticidad)}`}>
                      {orden.criticidad}
                    </span>
                  )}
                </div>

                {/* Info del equipo y técnico */}
                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <p><strong>ID Equipo:</strong> {idEquipoLabel}</p>
                  <p><strong>Serie:</strong> {orden.equipo_serie || orden.serie || "No especificada"}</p>
                  <p><strong>Ubicación:</strong> {orden.ubicacion || "—"}</p>
                  <p><strong>Ejecutado por:</strong> {orden.tecnico_nombre || orden.responsable || "—"}</p>
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
                          className="bg-[#D0FF34] text-[#111A3A] px-4 py-1.5 rounded-full text-xs font-semibold transition"
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

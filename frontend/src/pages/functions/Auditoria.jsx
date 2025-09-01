// frontend/src/pages/functions/Auditoria.jsx
import { useEffect, useState } from "react";
import { obtenerLogs } from "../../services/logsService";

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroTabla, setFiltroTabla] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const registrosPorPagina = 15;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await obtenerLogs();
        setLogs(data);
      } catch (err) {
        console.error("Error al cargar logs:", err);
      }
    };
    fetchLogs();
  }, []);

  const usuariosUnicos = [...new Set(logs.map(log => log.usuario).filter(Boolean))];
  const tablasUnicas = [...new Set(logs.map(log => log.tabla_afectada).filter(Boolean))];

  const logsFiltrados = logs.filter((log) => {
    const coincideUsuario = filtroUsuario ? log.usuario === filtroUsuario : true;
    const coincideTabla = filtroTabla ? log.tabla_afectada === filtroTabla : true;
    const coincideFecha = filtroFecha
      ? new Date(log.fecha).toISOString().slice(0, 10) === filtroFecha
      : true;
    return coincideUsuario && coincideTabla && coincideFecha;
  });

  const totalPaginas = Math.ceil(logsFiltrados.length / registrosPorPagina);
  const logsPaginados = logsFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const avanzarPagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const retrocederPagina = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  // Reiniciar a página 1 si cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroUsuario, filtroTabla, filtroFecha]);

  return (
    <div className="p-6 flex flex-col min-h-screen">
      {/* Título */}
      <h1 className="text-2xl text-[#111A3A] mb-4">Auditoría y Reportes</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <select
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            {usuariosUnicos.map((usuario, idx) => (
              <option key={idx} value={usuario}>
                {usuario}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tabla</label>
          <select
            value={filtroTabla}
            onChange={(e) => setFiltroTabla(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas</option>
            {tablasUnicas.map((tabla, idx) => (
              <option key={idx} value={tabla}>
                {tabla}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de logs */}
      {logsFiltrados.length === 0 ? (
        <p className="text-sm text-gray-500">No hay acciones de auditoría que coincidan con el filtro.</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-800">
          <h2 className="text-xl text-[#111A3A] mb-6">Acciones de auditoría</h2>
          {logsPaginados.map((log) => {
            const fechaFormateada = new Date(log.fecha).toLocaleDateString("es-CL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            return (
              <li key={log.id}>
                <span className="font-semibold text-[#111A3A]">{fechaFormateada}:</span>{" "}
                <span className="text-gray-700">
                  {log.usuario || "Usuario desconocido"} {log.accion} en la tabla{" "}
                  <strong>{log.tabla_afectada}</strong> (registro ID: {log.registro_id})
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Paginación fija */}
      <div className="mt-auto pt-6 flex justify-end gap-4">
        <button
          onClick={retrocederPagina}
          disabled={paginaActual === 1}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={avanzarPagina}
          disabled={paginaActual >= totalPaginas}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Auditoria;
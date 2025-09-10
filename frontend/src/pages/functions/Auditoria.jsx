// frontend/src/pages/functions/Auditoria.jsx
import { useEffect, useState } from "react";
import { obtenerLogs, exportarLogsExcel } from "../../services/logsService";
import { getHistorialOrdenes, exportarHistorialExcel } from "../../services/ordenesServices";

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroTabla, setFiltroTabla] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenes, setOrdenes] = useState([]);
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroIdEquipo, setFiltroIdEquipo] = useState("");
  const [filtroOt, setFiltroOt] = useState("");
  const [filtroFechaOt, setFiltroFechaOt] = useState("");
  const [paginaHistorial, setPaginaHistorial] = useState(1);

  const registrosPorPagina = 15;
  const registrosHistorialPorPagina = 5;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await obtenerLogs();
        setLogs(data);
      } catch (err) {
        console.error("Error al cargar logs:", err);
      }
    };
    const fetchHistorial = async () => {
      try {
        const data = await getHistorialOrdenes();
        setOrdenes(data);
      } catch (error) {
        console.error("Error al cargar historial en auditoría:", error);
      }
    };
    fetchLogs();
    fetchHistorial();
  }, []);

  const descargarBlob = (blob, nombreBase) => {
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreBase}_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportLogs = async () => {
    try {
      const blob = await exportarLogsExcel();
      descargarBlob(blob, 'logs_auditoria');
    } catch (err) {
      console.error('Error al exportar logs a Excel:', err);
    }
  };

  const handleExportHistorial = async () => {
    try {
      const blob = await exportarHistorialExcel();
      descargarBlob(blob, 'historial_tecnico');
    } catch (err) {
      console.error('Error al exportar historial a Excel:', err);
    }
  };

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

  const ordenesFiltradas = ordenes.filter((orden) => {
    const nombreCoincide = filtroEquipo
      ? orden.equipo_nombre?.toLowerCase().includes(filtroEquipo.toLowerCase())
      : true;
    const idCoincide = filtroIdEquipo
      ? String(orden.equipo_id).includes(filtroIdEquipo)
      : true;
    const otCoincide = filtroOt ? String(orden.id).includes(filtroOt) : true;
    const fechaCoincide = filtroFechaOt
      ? orden.fecha_ejecucion?.slice(0, 10) === filtroFechaOt
      : true;
    return nombreCoincide && idCoincide && otCoincide && fechaCoincide;
  });

  const totalPaginasHistorial = Math.ceil(
    ordenesFiltradas.length / registrosHistorialPorPagina
  );

  const ordenesPaginadas = ordenesFiltradas.slice(
    (paginaHistorial - 1) * registrosHistorialPorPagina,
    paginaHistorial * registrosHistorialPorPagina
  );

  const avanzarPaginaHistorial = () => {
    if (paginaHistorial < totalPaginasHistorial)
      setPaginaHistorial(paginaHistorial + 1);
  };

  const retrocederPaginaHistorial = () => {
    if (paginaHistorial > 1) setPaginaHistorial(paginaHistorial - 1);
  };

  useEffect(() => {
    setPaginaHistorial(1);
  }, [filtroEquipo, filtroIdEquipo, filtroOt, filtroFechaOt]);

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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl text-[#111A3A]">Acciones de auditoría</h2>
            <button onClick={handleExportLogs} className="px-3 py-1 text-sm rounded-full bg-[#D0FF34] text-[#111A3A] font-semibold">Descargar Excel</button>
          </div>
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

      {/* Paginación de logs */}
      <div className="mt-4 flex justify-end gap-4">
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

      {/* Historial técnico */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-[#111A3A]">Historial técnico</h2>
          <button onClick={handleExportHistorial} className="px-3 py-1 text-sm rounded-full bg-[#D0FF34] text-[#111A3A] font-semibold">Descargar Excel</button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          />
          <input
            type="text"
            placeholder="ID de equipo"
            value={filtroIdEquipo}
            onChange={(e) => setFiltroIdEquipo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          />
          <input
            type="text"
            placeholder="Número OT"
            value={filtroOt}
            onChange={(e) => setFiltroOt(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          />
          <input
            type="date"
            value={filtroFechaOt}
            onChange={(e) => setFiltroFechaOt(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          />
        </div>

        {ordenesFiltradas.length === 0 ? (
          <p className="text-sm text-gray-500">No hay órdenes que coincidan con el filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="text-left text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-2">OT</th>
                  <th className="px-4 py-2">ID Equipo</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {ordenesPaginadas.map((orden) => (
                  <tr key={orden.id} className="border-t">
                    <td className="px-4 py-2">
                      {`OT${String(orden.id).padStart(4, "0")}`}
                    </td>
                    <td className="px-4 py-2">
                      {`ID${String(orden.equipo_id).padStart(4, "0")}`}
                    </td>
                    <td className="px-4 py-2">{orden.equipo_nombre}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold tracking-wide ${(() => {
                          const e = (orden.estado || '').toLowerCase();
                          if (e === 'pendiente') return 'bg-[#D3DDE7] text-[#19123D]';
                          if (e === 'realizada' || e === 'ejecutada') return 'bg-[#D6B4FC] text-[#19123D]';
                          if (e === 'firmada' || e === 'completada' || e === 'completadas') return 'bg-[#003D31] text-[#F0FF3D]';
                          if (e === 'validada') return 'bg-[#273287] text-[#F0FF3D]';
                          return 'bg-gray-400 text-white';
                        })()}`}
                      >
                        {orden.estado?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={retrocederPaginaHistorial}
            disabled={paginaHistorial === 1}
            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={avanzarPaginaHistorial}
            disabled={paginaHistorial >= totalPaginasHistorial}
            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;

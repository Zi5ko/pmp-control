//frontend/src/pages/functions/Auditoria.jsx
import { useEffect, useState } from "react";
import { obtenerLogs } from "../../services/logsService";

const Auditoria = () => {
  const [logs, setLogs] = useState([]);

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

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Log de Auditoría</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Acción</th>
              <th className="px-4 py-2">Tabla</th>
              <th className="px-4 py-2">ID Registro</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="px-4 py-2">{new Date(log.fecha).toLocaleString()}</td>
                <td className="px-4 py-2">{log.usuario || "Desconocido"}</td>
                <td className="px-4 py-2">{log.accion}</td>
                <td className="px-4 py-2">{log.tabla_afectada}</td>
                <td className="px-4 py-2">{log.registro_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Auditoria;
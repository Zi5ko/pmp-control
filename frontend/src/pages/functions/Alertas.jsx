// frontend/src/pages/functions/Alertas.jsx
import { useEffect, useState } from 'react';
import { obtenerAlertas } from '../../services/alertasService';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerAlertas();
        setAlertas(data);
      } catch (error) {
        console.error('Error al obtener alertas:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#111A3A] mb-4">Alertas del sistema</h2>
  
      {alertas.length === 0 ? (
        <p className="text-sm text-gray-500">No hay alertas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl shadow-sm bg-white">
            <thead className="bg-[#F3F4F6] text-[#111A3A] text-left text-sm font-semibold">
              <tr>
                <th className="px-4 py-3">ID Alerta</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Criticidad</th>
                <th className="px-4 py-3">Mensaje</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y">
              {alertas.map((alerta) => {
                const fecha = new Date(alerta.generada_en);
                const fechaFormateada = fecha.toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }) + " " + fecha.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
  
                return (
                  <tr key={alerta.id}>
                    <td className="px-4 py-3">{alerta.id}</td>
                    <td className="px-4 py-3">{alerta.equipo_nombre || "Equipo no registrado"}</td>
                    <td className="px-4 py-3">{alerta.ubicacion || "No especificada"}</td>
                    <td className="px-4 py-3 font-semibold">
                      {alerta.criticidad === "crítico" ? (
                        <span className="text-red-600">Crítico</span>
                      ) : alerta.criticidad === "relevante" ? (
                        <span className="text-yellow-600">Relevante</span>
                      ) : (
                        <span className="text-gray-600">No relevante</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{alerta.mensaje}</td>
                    <td className="px-4 py-3">{fechaFormateada}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Alertas;
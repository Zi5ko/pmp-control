import { useEffect, useState } from "react";
import axios from "axios";

export default function Visualizar() {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/equipos`)
      .then((res) => {
        setEquipos(res.data);
      })
      .catch((err) => {
        console.error("❌ Error al cargar equipos:", err);
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Equipos Registrados</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Nombre</th>
              <th className="border px-3 py-2">Familia</th>
              <th className="border px-3 py-2">Marca</th>
              <th className="border px-3 py-2">Modelo</th>
              <th className="border px-3 py-2">Ubicación</th>
              <th className="border px-3 py-2">Criticidad</th>
              <th className="border px-3 py-2">Plan</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo) => (
              <tr key={equipo.id}>
                <td className="border px-3 py-1">{equipo.id}</td>
                <td className="border px-3 py-1">{equipo.nombre}</td>
                <td className="border px-3 py-1">{equipo.familia}</td>
                <td className="border px-3 py-1">{equipo.marca}</td>
                <td className="border px-3 py-1">{equipo.modelo}</td>
                <td className="border px-3 py-1">{equipo.ubicacion}</td>
                <td className="border px-3 py-1">{equipo.criticidad}</td>
                <td className="border px-3 py-1">{equipo.nombre_plan || "Sin plan"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
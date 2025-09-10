import { useEffect, useState } from "react";
import axios from "axios";

export default function PlanesManager({ onClose, onPlanCreated }) {
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    frecuencia: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cargarPlanes = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/planes`);
      setPlanes(data || []);
    } catch (err) {
      // Silencioso en listado
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre || !form.tipo) {
      setError("Completa al menos nombre y tipo.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const body = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        frecuencia: form.frecuencia || null,
      };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/planes`, body, cfg);
      setSuccess("Plan creado correctamente.");
      setForm({ nombre: "", tipo: "", frecuencia: "" });
      await cargarPlanes();
      if (onPlanCreated) onPlanCreated(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-[#111A3A]">Crear Plan de Mantenimiento</h3>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {success && (
            <div className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded">{success}</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded">{error}</div>
          )}

          {/* Formulario similar al de equipos */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Nombre del plan</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Selecciona</option>
                  <option value="garantía">Garantía</option>
                  <option value="contrato">Contrato</option>
                  <option value="ninguno">Ninguno</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Frecuencia</label>
                <select
                  name="frecuencia"
                  value={form.frecuencia}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Sin definir</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              {/* Removed protocolo_base field as requested */}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D0FF34] text-[#111A3A] text-sm font-semibold px-6 py-2 rounded shadow hover:opacity-90 disabled:opacity-70"
              >
                {loading ? 'Guardando…' : 'Guardar Plan'}
              </button>
            </div>
          </form>

          {/* Tabla de planes ingresados */}
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-[#111A3A] mb-2">Planes ingresados</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {planes.length === 0 && (
                    <tr>
                      <td className="px-4 py-3 text-gray-500" colSpan={4}>Sin planes registrados.</td>
                    </tr>
                  )}
                  {planes.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">{p.id}</td>
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2 capitalize">{p.tipo || '-'}</td>
                      <td className="px-4 py-2 capitalize">{p.frecuencia || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

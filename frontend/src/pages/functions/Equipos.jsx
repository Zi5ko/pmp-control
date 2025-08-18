import { useState, useEffect } from "react";
import axios from "axios";

const opcionesCriticidad = [
  "crítico",
  "relevante",
  "instalación relevante",
  "equipo ni crítico ni relevante",
  "instalación no relevante"
];

export default function Equipos() {
  const [form, setForm] = useState({
    familia: "",
    marca: "",
    modelo: "",
    criticidad: opcionesCriticidad[0],
    ubicacion: "",
    plan_id: ""
  });

  const [planes, setPlanes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/planes`)
      .then(res => setPlanes(res.data))
      .catch(err => console.error("❌ Error al obtener planes:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generarNombre = () => {
    return `${form.familia} - ${form.marca} - ${form.modelo}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataEnviar = {
        ...form,
        nombre: generarNombre(),
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/equipos`,
        dataEnviar
      );

      setMensaje(`✅ Equipo registrado con ID: ${data.id}`);
      setForm({
        familia: "",
        marca: "",
        modelo: "",
        criticidad: opcionesCriticidad[0],
        ubicacion: "",
        plan_id: ""
      });
    } catch (error) {
      console.error("❌ Error al registrar equipo:", error);
      setMensaje("❌ Error al registrar el equipo. Intenta nuevamente.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Equipos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Familia</label>
          <input
            type="text"
            name="familia"
            value={form.familia}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Marca</label>
          <input
            type="text"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Modelo</label>
          <input
            type="text"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Criticidad</label>
          <select
            name="criticidad"
            value={form.criticidad}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {opcionesCriticidad.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Plan de mantenimiento</label>
          <select
            name="plan_id"
            value={form.plan_id}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona un plan</option>
            {planes.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">
            <strong>Nombre generado:</strong> {generarNombre()}
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrar equipo
        </button>

        {mensaje && <p className="text-center text-sm mt-2 text-gray-700">{mensaje}</p>}
      </form>
    </div>
  );
}
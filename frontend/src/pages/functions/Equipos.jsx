// frontend/src/pages/functions/Equipos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";
import { Tag, Wrench, Package, MapPin, ShieldCheck, ListChecks } from "lucide-react";

const opcionesCriticidad = [
  "crítico",
  "relevante",
  "instalación relevante",
  "equipo ni crítico ni relevante",
  "instalación no relevante",
];

export default function Equipos() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const rolId = Number(user?.rol_id);

    if (!user || ![1, 6].includes(rolId)) {

      navigate("/no-autorizado");
    }
  }, [navigate, user]);

  const [form, setForm] = useState({
    familia: "",
    marca: "",
    modelo: "",
    criticidad: "",
    ubicacion: "",
    plan_id: "",
    serie: "",
    fecha_ingreso: "",
  });

  const [planes, setPlanes] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/planes`)
      .then((res) => setPlanes(res.data))
      .catch((err) => {
        console.error("Error al obtener planes:", err);
        setMensaje({ tipo: "error", texto: "Error al cargar planes. Intenta recargar." });
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generarNombre = () => {
    return `${form.familia} - ${form.marca} - ${form.modelo}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.plan_id) {
      setMensaje({ tipo: "error", texto: "Debes seleccionar un plan de mantenimiento." });
      return;
    }

    const fechaHoy = new Date().toISOString().split("T")[0];

    const dataEnviar = {
      ...form,
      nombre: generarNombre(),
      fecha_ingreso: fechaHoy,
    };

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/equipos`, dataEnviar);

      const idFormateado = `ID${String(data.id).padStart(4, "0")}`;

      setMensaje({ tipo: "success", texto: `Equipo registrado con ${idFormateado}` });

      setForm({
        familia: "",
        marca: "",
        modelo: "",
        criticidad: "",
        ubicacion: "",
        plan_id: "",
        serie: "",
      });
    } catch (error) {
      console.error("❌ Error al registrar equipo:", error);
      if (error.response?.status === 409) {
        setMensaje({
          tipo: "error",
          texto: "Ya existe un equipo con la misma marca, modelo y serie.",
        });
      } else {
        setMensaje({
          tipo: "error",
          texto: "Error al registrar el equipo. Intenta nuevamente.",
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner title="Registro exitoso" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner title="Error" message={mensaje.texto} onClose={() => setMensaje(null)} />
      )}

      <h2 className="text-2xl font-bold mb-6">Registro de Equipos</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Familia</label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="familia"
                value={form.familia}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Marca</label>
            <div className="relative">
              <Wrench className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Modelo</label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Criticidad</label>
            <select
              name="criticidad"
              value={form.criticidad}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Selecciona</option>
              {opcionesCriticidad.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-700 mb-1">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-700 mb-1">Plan de mantenimiento</label>
            <div className="relative">
              <ListChecks className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <select
                name="plan_id"
                value={form.plan_id}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">Selecciona un plan</option>
                {planes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:opacity-90"
          >
            Registrar Equipo
          </button>
        </div>
      </form>
    </div>
  );
}
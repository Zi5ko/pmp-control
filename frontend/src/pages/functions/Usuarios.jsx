import { useEffect, useState } from "react";
import api from "../../services/api";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "", email: "", rol_id: "", tipo: "local" });
  const [editId, setEditId] = useState(null);

  const cargarUsuarios = () => {
    api
      .get("/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch(() =>
        setMensaje({ tipo: "error", texto: "Error al cargar usuarios." })
      );
  };

  const cargarRoles = () => {
    api
      .get("/roles")
      .then((res) => setRoles(res.data))
      .catch(() =>
        setMensaje({ tipo: "error", texto: "Error al cargar roles." })
      );
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, {
          nombre: form.nombre,
          email: form.email,
          rol_id: form.rol_id,
        });
        setMensaje({ tipo: "success", texto: "Usuario actualizado." });
      } else {
        const { data } = await api.post("/usuarios", form);
        let texto = "Usuario creado.";
        if (data.password) {
          texto += ` Clave por defecto: ${data.password}`;
        }
        setMensaje({ tipo: "success", texto });
      }

      setForm({ nombre: "", email: "", rol_id: "", tipo: "local" });
      setEditId(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setMensaje({ tipo: "error", texto: "Error al guardar usuario." });
    }
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({
      nombre: u.nombre,
      email: u.email,
      rol_id: u.rol_id,
      tipo: u.password_hash ? "local" : "google",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setMensaje({ tipo: "error", texto: "Error al eliminar usuario." });
    }
  };

  const obtenerRol = (rolId) => roles.find((r) => r.id === rolId)?.nombre || "-";

  return (
    <div className="p-6">
      {mensaje?.tipo === "success" && (
        <SuccessBanner
          title="Operación exitosa"
          message={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}
      {mensaje?.tipo === "error" && (
        <ErrorBanner
          title="Error"
          message={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-6">Gestión de usuarios</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Rol</label>
            <select
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Selecciona</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="local">Local</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#D0FF34] text-[#111A3A] font-semibold px-6 py-2 rounded shadow hover:opacity-90"
          >
            {editId ? "Actualizar Usuario" : "Crear Usuario"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 text-sm text-gray-800">{u.id}</td>
                <td className="p-3 text-sm text-gray-600">{u.nombre}</td>
                <td className="p-3 text-sm text-gray-600">{u.email}</td>
                <td className="p-3 text-sm text-gray-600">{obtenerRol(u.rol_id)}</td>
                <td className="p-3 text-sm">
                  <button
                    onClick={() => handleEdit(u)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// src/components/calendar/EventModal.jsx
import { useNavigate } from "react-router-dom";

export default function EventModal({ evento, onClose }) {
  const navigate = useNavigate();

  if (!evento) return null;

  const esProyectado = evento.tipo === "proyectado";
  const user = JSON.parse(localStorage.getItem("user"));
  const rolNombre = user?.rol_nombre?.toLowerCase() || "administrador";

  const handleGestionClick = () => {
    navigate(`/${rolNombre}/gestion?equipo_id=${evento.equipo_id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4 text-[#111A3A]">Detalle del mantenimiento</h2>

        <ul className="text-sm space-y-2">
          <li><strong>Equipo:</strong> {evento.title || "-"}</li>
          <li><strong>Serie:</strong> {evento.serie || "-"}</li>
          <li><strong>ID:</strong> {evento.equipo_id}</li>
          <li><strong>Plan:</strong> {evento.plan || "-"}</li>
          <li><strong>Ubicación:</strong> {evento.ubicacion || "-"}</li>
          <li><strong>Estado:</strong> {evento.estado || "-"}</li>
          <li><strong>Criticidad:</strong> {evento.criticidad || "-"}</li>
          <li><strong>Fecha:</strong> {evento.start?.toLocaleDateString("es-CL") || "-"}</li>
          <li><strong>Tipo:</strong> {esProyectado ? "Proyectado" : "Planificado"}</li>

          {!esProyectado && evento.id && (
            <li><strong>OT registrada:</strong> #{evento.id}</li>
          )}

          {evento.siguiente && (
            <li><strong>Próximo mantenimiento:</strong> {new Date(evento.siguiente).toLocaleDateString("es-CL")}</li>
          )}
        </ul>

        {/* Solo mostrar el botón si es un evento planificado */}
        {!esProyectado && (
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
            onClick={handleGestionClick}
          >
            Reprogramar este mantenimiento
          </button>
        )}
      </div>
    </div>
  );
}
// src/components/calendar/EventModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRutaPorRol } from "../../utils/rutasPorRol";
import FloatingBanner from "../FloatingBanner";
import { XCircle } from "lucide-react";


export default function EventModal({ evento, onClose }) {
  const navigate = useNavigate();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  if (!evento) return null;

  const esProyectado = evento.tipo === "proyectado";
  const user = JSON.parse(localStorage.getItem("user"));
  const rolPath = getRutaPorRol(user?.rol_nombre);

  const confirmarReprogramacion = () => {
    setMostrarConfirmacion(false);
    onClose();
    navigate(
      `${rolPath}/gestion?equipo_id=${evento.equipo_id}&fecha_anterior=${
        evento.start.toISOString().split("T")[0]
      }`
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm relative">
          <button
            className="absolute top-6 right-6 text-[#111A3A] hover:text-gray-600"
            onClick={onClose}
          >
            <XCircle size={20} />
          </button>

          <h2 className="text-lg font-bold text-[#111A3A] mb-2">
            {evento.title || "Mantenimiento"}
          </h2>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Estado</span>
              <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${getEstadoColor(evento.estado)}`}>
                {esProyectado ? "Proyectado" : evento.estado || "-"}
              </span>
            </div>

            {!esProyectado && evento.id && (
              <div className="flex justify-between">
                <span className="text-gray-500">OT registrada</span>
                <span>#{evento.id}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Responsable</span>
              <span>{evento.responsable || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Fecha</span>
              <span>{evento.start?.toLocaleDateString("es-CL") || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Ubicación</span>
              <span>{evento.ubicacion || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span>{evento.equipo_id ? `ID${String(evento.equipo_id).padStart(4, "0")}` : "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Serie</span>
              <span>{evento.serie || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Criticidad</span>
              <span>{evento.criticidad || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span>{evento.plan || "-"}</span>
            </div>

            {evento.siguiente && (
              <div className="flex justify-between">
                <span className="text-gray-500">Próximo mantenimiento</span>
                <span>{new Date(evento.siguiente).toLocaleDateString("es-CL")}</span>
              </div>
            )}
          </div>

          {!esProyectado && (
            <button
              className="mt-6 w-full bg-[#D0FF34] text-[#111A3A] font-semibold py-2 rounded shadow hover:bg-lime-300 text-sm"
              onClick={() => setMostrarConfirmacion(true)}
            >
              Reprogramar este mantenimiento
            </button>
          )}
        </div>
      </div>

      {/* Banner de confirmación */}
      {mostrarConfirmacion && (
        <FloatingBanner
          titulo="¿Reprogramar mantenimiento?"
          mensaje="La orden actual será reprogramada. Serás redirigido a la sección de gestión donde deberás seleccionar una nueva fecha."
          onConfirm={confirmarReprogramacion}
          onCancel={() => setMostrarConfirmacion(false)}
        />
      )}
    </>
  );
}

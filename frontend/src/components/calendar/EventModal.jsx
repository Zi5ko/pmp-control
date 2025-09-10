// src/components/calendar/EventModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRutaPorRol } from "../../utils/rutasPorRol";
import FloatingBanner from "../FloatingBanner";
import ModalEjecutarOrden from "../ordenes/ModalEjecutarOrden";
import { XCircle, Flag, Hash } from "lucide-react";

const getEstadoColor = (estado = "") => {
  const e = (estado || "").toLowerCase();
  // Paleta unificada
  if (e === "pendiente") return "bg-[#D3DDE7] text-[#19123D]";
  if (e === "realizada" || e === "ejecutada") return "bg-[#D6B4FC] text-[#19123D]";
  if (e === "firmada" || e === "completada" || e === "completadas") return "bg-[#003D31] text-[#F0FF3D]";
  if (e === "validada") return "bg-[#273287] text-[#F0FF3D]";
  if (e === "reprogramada") return "bg-orange-200 text-orange-800";
  if (e === "cancelada") return "bg-red-200 text-red-800";
  if (e === "proyectado") return "bg-gray-200 text-gray-700";
  return "bg-gray-200 text-gray-700";
};

// Colores para la criticidad (alineado al resto de modales)
const getCriticidadColor = (crit = "") => {
  if (!crit) return "bg-gray-300 text-[#19123D]";
  const key = crit.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (key.includes("critico")) return "bg-[#FF7144] text-white"; // Crítico
  if (key.startsWith("relevante") || key === "relevante") return "bg-[#334ED8] text-[#F0FF3D]"; // Relevante
  if (key.includes("instalacion")) return "bg-[#D8E6FF] text-[#19123D]"; // Instalaciones relevantes
  return "bg-gray-300 text-[#19123D]";
};

export default function EventModal({ evento, onClose }) {
  const navigate = useNavigate();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarEjecutar, setMostrarEjecutar] = useState(false);

  if (!evento) return null;

  const esProyectado = evento.tipo === "proyectado";
  const user = JSON.parse(localStorage.getItem("user"));
  const rolPath = getRutaPorRol(user?.rol_nombre);
  const rol = user?.rol_nombre
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const confirmarReprogramacion = () => {
    setMostrarConfirmacion(false);
    onClose();
    navigate(
      `${rolPath}/gestion?equipo_id=${evento.equipo_id}&fecha_anterior=${
        evento.start.toISOString().split("T")[0]
      }&orden_id=${evento.id}`
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

          {/* Encabezado con OT sobre el nombre del equipo */}
          <div className="mb-2">
            {!esProyectado && evento.id && (
              <span className="inline-flex items-center rounded-full bg-[#19123D] text-white text-xs font-semibold px-3 py-1 select-none">
                <Hash className="w-3.5 h-3.5 mr-1" />
                {`OT${String(evento.id).padStart(4, "0")}`}
              </span>
            )}
            <h2 className="mt-2 text-lg font-bold text-[#111A3A]">
              {evento.title || "Mantenimiento"}
            </h2>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Estado</span>
              <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${getEstadoColor(evento.estado)}`}>
                {esProyectado ? "Proyectado" : evento.estado || "-"}
              </span>
            </div>

            {/* Criticidad bajo el estado, con formato de chip y colores de criticidad */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Criticidad</span>
              <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${getCriticidadColor(evento.criticidad)}`}>
                {evento.criticidad || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Responsable</span>
              {evento.responsable ? (
                <span>{evento.responsable}</span>
              ) : (
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold bg-[#FFE8D2] text-[#19123D]">
                  <Flag size={12} className="mr-1" />
                  Falta asignación
                </span>
              )}
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

          {!esProyectado &&
            rol !== "tecnico" &&
            rol !== "supervisor" &&
            evento.estado?.toLowerCase() === "pendiente" && (
              <button
                className="mt-6 w-full bg-[#D0FF34] text-[#111A3A] font-semibold py-2 rounded shadow hover:bg-lime-300 text-sm"
                onClick={() => setMostrarConfirmacion(true)}
              >
                Reprogramar este mantenimiento
              </button>
            )}

          {!esProyectado &&
            rol === "tecnico" &&
            evento.estado?.toLowerCase() === "pendiente" && (
              <button
                className="mt-6 w-full bg-[#D0FF34] text-[#111A3A] font-semibold py-2 rounded shadow hover:bg-lime-300 text-sm"
                onClick={() => setMostrarEjecutar(true)}
              >
                Ejecutar orden
              </button>
            )}

          {!esProyectado &&
            rol === "tecnico" &&
            evento.estado?.toLowerCase() === "validada" && (
              <button
                className="mt-6 w-full bg-[#D0FF34] text-[#111A3A] font-semibold py-2 rounded shadow hover:bg-lime-300 text-sm"
                onClick={() => {
                  onClose();
                  navigate(`${rolPath}/registros-firmas?orden_id=${evento.id}`);
                }}
              >
                Registrar firma
              </button>
            )}

          {!esProyectado && rol === "supervisor" && !evento.responsable && (
            <button
              className="mt-6 w-full bg-[#D0FF34] text-[#111A3A] font-semibold py-2 rounded shadow hover:bg-lime-300 text-sm"
              onClick={() => navigate(`${rolPath}/asignar-ordenes?orden_id=${evento.id}`)}
            >
              Asignar orden
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

      {mostrarEjecutar && (
        <ModalEjecutarOrden
          ordenId={evento.id}
          equipoId={evento.equipo_id}
          equipoSerie={evento.serie}
          equipoNombre={evento.title}
          equipoUbicacion={evento.ubicacion}
          observacionesPrevias={evento.observaciones}
          onClose={() => setMostrarEjecutar(false)}
          onSuccess={() => {
            setMostrarEjecutar(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

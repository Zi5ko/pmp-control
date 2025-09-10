// src/pages/functions/Planificacion.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MiniCalendar from "../../components/MiniCalendar";
import CalendarContainer from "../../components/calendar/CalendarContainer";
import FloatingBanner from "../../components/FloatingBanner";
import SuccessBanner from "../../components/SuccesBanner";
import ErrorBanner from "../../components/ErrorBanner";
import { getRutaPorRol } from "../../utils/rutasPorRol";
import PlanesManager from "../../components/PlanesManager";

export default function Planificacion() {
  const [eventosTotales, setEventosTotales] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [recargando, setRecargando] = useState(false);
  const [filtrosCriticidad, setFiltrosCriticidad] = useState({
    crítico: true,
    relevante: true,
    instalación: true
  });

  const [equipoAProgramar, setEquipoAProgramar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarSuccess, setMostrarSuccess] = useState(false);
  const [mensajeSuccess, setMensajeSuccess] = useState("");
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const basePath = getRutaPorRol(user?.rol_nombre);
  const canPlan = [1, 5, 6].includes(Number(user?.rol_id));
  const [abrirPlanes, setAbrirPlanes] = useState(false);

  // 👉 Cargar eventos
  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/eventos`, config);

      const eventosConvertidos = data.map((evento) => ({
        id: evento.id?.toString() || `p-${evento.equipo_id}-${evento.start}`,
        title: evento.title,
        start: new Date(evento.start),
        end: new Date(evento.end),
        allDay: true,
        criticidad: evento.criticidad || "media",
        estado: evento.estado || "proyectado",
        tipo: evento.tipo || "proyectado",
        serie: evento.serie || "-",
        plan: evento.plan || "-",
        ubicacion: evento.ubicacion || "-",
        responsable: evento.responsable || null,
        equipo_id: evento.equipo_id
      }));

      setEventosTotales(eventosConvertidos);
    } catch (error) {
      console.error("❌ Error al cargar eventos:", error);
    }
  };

  // 👉 Cargar equipos sin programación
  const fetchFaltantes = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ordenes/faltantes`);
      setFaltantes(data);
    } catch (error) {
      console.error("❌ Error al cargar faltantes:", error);
    }
  };

  // 👉 Aplicar filtros por criticidad
  const normalizar = (txt = "") =>
    String(txt)
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const mapCriticidad = (c = "") => {
    const v = normalizar(c);
    if (v.includes("instalacion")) return "instalación";
    if (v === "critico") return "crítico";
    if (v === "relevante") return "relevante";
    return v || "otros";
  };

  const aplicarFiltroCriticidad = () => {
    const activos = Object.keys(filtrosCriticidad).filter(c => filtrosCriticidad[c]);
    const filtrados = eventosTotales.filter(ev => activos.includes(mapCriticidad(ev.criticidad)));
    setEventosFiltrados(filtrados);
  };

  // 👉 Abrir banner de confirmación
  const programarEquipo = (equipo_id, nombre) => {
    setEquipoAProgramar({ equipo_id, nombre });
    setMostrarConfirmacion(true);
  };

  // 👉 Confirmar programación
  const confirmarProgramacion = async () => {
    setMostrarConfirmacion(false);
    setRecargando(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/ordenes`, {
        equipo_id: equipoAProgramar.equipo_id,
        fecha_programada: new Date().toISOString().slice(0, 10),
        estado: "pendiente"
      });

      setMensajeSuccess(`✅ El equipo "${equipoAProgramar.nombre}" fue programado con éxito.`);
      setMostrarSuccess(true);
      await fetchEventos();
      await fetchFaltantes();
    } catch (error) {
      console.error("❌ Error al programar equipo:", error);
      setMensajeError("❌ Ocurrió un error al programar el equipo.");
      setMostrarError(true);
    } finally {
      setRecargando(false);
    }
  };

  // 👉 Efectos
  useEffect(() => {
    fetchEventos();
    fetchFaltantes();
  }, []);

  useEffect(() => {
    aplicarFiltroCriticidad();
  }, [eventosTotales, filtrosCriticidad]);

  const toggleCriticidad = (tipo) => {
    setFiltrosCriticidad((prev) => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row p-6 gap-6">
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
          <MiniCalendar />

          {/* Filtro de criticidad */}
          <div className="bg-[#5C7BA1] rounded-xl shadow p-4 text-white">
            <h3 className="text-sm font-semibold mb-2">Filtro de criticidad</h3>
            <ul className="space-y-2 text-sm">
              {["crítico", "relevante", "instalación"].map((tipo) => (
                <li key={tipo}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filtrosCriticidad[tipo]}
                      onChange={() => toggleCriticidad(tipo)}
                      className="mr-2 accent-white"
                    />
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Botón crear plan (debajo del filtro, antes de equipos pendientes si aplica) */}
          {canPlan && (
            <div>
              <button
                onClick={() => setAbrirPlanes(true)}
                className="w-full bg-[#D0FF34] text-[#111A3A] text-sm font-semibold px-4 py-2 rounded shadow hover:opacity-90"
              >
                Crear plan de mantenimiento
              </button>
            </div>
          )}

          {/* Equipos faltantes */}
          {faltantes.length > 0 && (
            <div className="bg-[#5C7BA1] rounded-xl shadow p-4 text-white">
              <h2 className="text-sm font-semibold mb-2">Equipos sin programación</h2>
              <ul className="text-xs space-y-2">
                {faltantes.slice(0, 5).map((eq) => (
                  <li key={eq.equipo_id} className="flex justify-between items-center">
                    <span>{eq.nombre}</span>
                    <button
                      onClick={() => programarEquipo(eq.equipo_id, eq.nombre)}
                      disabled={recargando}
                      className="bg-white text-[#5C7BA1] text-xs px-2 py-0.5 rounded hover:bg-gray-100"
                    >
                      Programar
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mostrar mensaje de equipos adicionales */}
              {faltantes.length > 5 && (
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold">+ {faltantes.length - 5} equipos</p>
                </div>
              )}

              {/* Botón de gestión */}
              <button
                onClick={() => navigate(`${basePath}/gestion`)}
                className="mt-4 w-full text-xs bg-white text-[#5C7BA1] py-1.5 rounded hover:bg-gray-100 font-semibold"
              >
                Ir a gestión de planificación
              </button>
            </div>
          )}
        </div>

        {/* CALENDARIO PRINCIPAL */}
        <div className="w-full order-1 lg:order-2">
          <CalendarContainer eventos={eventosFiltrados} />
        </div>
      </div>

      {/* 🟨 CONFIRMACIÓN */}
      {mostrarConfirmacion && equipoAProgramar && (
        <FloatingBanner
          mensaje={`¿Deseas programar el equipo "${equipoAProgramar.nombre}" desde hoy?`}
          onConfirm={confirmarProgramacion}
          onCancel={() => setMostrarConfirmacion(false)}
        />
      )}

      {/* ✅ ÉXITO */}
      {mostrarSuccess && (
        <SuccessBanner mensaje={mensajeSuccess} onClose={() => setMostrarSuccess(false)} />
      )}

      {/* ❌ ERROR */}
      {mostrarError && (
        <ErrorBanner mensaje={mensajeError} onClose={() => setMostrarError(false)} />
      )}

      {abrirPlanes && (
        <PlanesManager
          onClose={() => setAbrirPlanes(false)}
          onPlanCreated={() => { /* se autogestiona */ }}
        />
      )}
    </>
  );
}

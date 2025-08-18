//frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Recuperar from "./pages/auth/Recuperar";
import GoogleSuccess from "./pages/auth/GoogleSuccess";

import ProtectedRoute from "./routes/ProtectedRoute";
import LayoutBase from "./components/LayoutBase";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import NoAutorizado from "./pages/auth/NoAutorizado";

import InicioAdmin from "./roles/admin/Inicio";
import InicioTecnico from "./roles/tecnico/Inicio";
import InicioSupervisor from "./roles/supervisor/Inicio";
import InicioResponsable from "./roles/responsable/Inicio";
import InicioESMP from "./roles/esmp/Inicio";

import Usuarios from "./pages/functions/Usuarios";
import Equipos from "./pages/functions/Equipos";
import Reportes from "./pages/functions/Reportes";
import Calendario from "./pages/functions/Calendario";
import Visualizar from "./pages/functions/ListaEquipos";
import Planificacion from "./pages/functions/Planificacion";
import AsignarOrdenes from "./pages/functions/AsignarOrden";
import HistorialTecnico from "./pages/functions/HistorialTécnico";

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (e) {
      return false;
    }
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />

        {/* Ruta raíz */}
        <Route
          path="/"
          element={isAuthenticated() ? <DashboardRouter /> : <Login />}
        />

        {/* Acceso no autorizado */}
        <Route
          path="/no-autorizado"
          element={<NoAutorizado />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="administrador">
              <LayoutBase />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioAdmin />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="equipos" element={<Equipos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="lista-equipos" element={<Visualizar />} />
          <Route path="planificacion" element={<Planificacion />} />
          <Route path="asignar-ordenes" element={<AsignarOrdenes />} />
          <Route path="historial" element={<HistorialTecnico />} />
        </Route>

        {/* TECNICO */}
        <Route
          path="/tecnico"
          element={
            <ProtectedRoute role="técnico">
              <LayoutBase />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioTecnico />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="historial" element={<HistorialTecnico />} />
        </Route>

        {/* SUPERVISOR */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute role="supervisor">
              <LayoutBase />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioSupervisor />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="asignar-ordenes" element={<AsignarOrdenes />} />
        </Route>

        {/* RESPONSABLE */}
        <Route
          path="/responsable"
          element={
            <ProtectedRoute role="responsable_institucional">
              <LayoutBase />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioResponsable />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="auditoria" element={<p>Auditoría (placeholder)</p>} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="lista-equipos" element={<Visualizar />} />
          <Route path="asignar-ordenes" element={<AsignarOrdenes />} />
        </Route>

        {/* ESMP */}
        <Route
          path="/esmp"
          element={
            <ProtectedRoute role="esmp">
              <LayoutBase />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioESMP />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="equipos" element={<Equipos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="visualizar" element={<Visualizar />} />
          <Route path="asignar-ordenes" element={<AsignarOrdenes />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<p className="text-center p-4 text-red-500">Página no encontrada</p>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
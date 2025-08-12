import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardRouter from "./pages/DashboardRouter";
import InicioAdmin from "./pages/admin/Inicio";
import InicioTecnico from "./pages/tecnico/Inicio";
import InicioSupervisor from "./pages/supervisor/Inicio";
import InicioResponsable from "./pages/responsable/Inicio";
import InicioESMP from "./pages/esmp/Inicio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardRouter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<InicioAdmin />} />
        <Route path="/tecnico" element={<InicioTecnico />} />
        <Route path="/supervisor" element={<InicioSupervisor />} />
        <Route path="/responsable" element={<InicioResponsable />} />
        <Route path="/esmp" element={<InicioESMP />} />
        <Route path="*" element={<p>Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

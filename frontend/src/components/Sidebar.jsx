//frontend/src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Calendar,
  FileText,
  Users,
  MonitorDot,
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Settings,
  User,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ClockIcon,
} from "lucide-react";
import logo from "../assets/hosdip logo_Logo Original Blanco.png";

const menuPorRol = {
  administrador: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/planificacion", label: "Planificación", icon: ClipboardList },
    {
      label: "Mantenimiento",
      icon: Wrench,
      children: [
        { path: "/admin/reportes", label: "Ejecutar Mantenimiento", icon: ClipboardList },
        { path: "/admin/asignar-ordenes", label: "Asignar Órdenes", icon: UserCheck },
        { path: "/admin/historial", label: "Historial Técnico", icon: ClockIcon },
        { path: "/admin/validacion", label: "Validar Mantenimientos", icon: ClipboardList },
        { path: "/admin/registros-firmas", label: "Registros y Firmas", icon: FileText }
      ]
    },
    {
      label: "Gestión de Equipos",
      icon: MonitorDot,
      children: [
        { path: "/admin/equipos", label: "Registrar Equipos", icon: ClipboardList },
        { path: "/admin/lista-equipos", label: "Lista de Equipos", icon: Wrench }
      ]
    },
    { path: "/admin/calendario", label: "Auditoría y Reportes", icon: FileText },
    { path: "/admin/usuarios", label: "Gestión de usuarios y equipos", icon: Users },
    { path: "/admin/perfil", label: "Perfil de usuario", icon: User }
  ],
  tecnico: [
    { path: "/tecnico", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tecnico/calendario", label: "Calendario", icon: Calendar },
    {
      label: "Mantenimiento",
      icon: Wrench,
      children: [
        { path: "/tecnico/historial", label: "Historial técnico", icon: ClockIcon },
        { path: "/tecnico/registros-firmas", label: "Registros y Firmas", icon: FileText }
      ]
    },
    { path: "/tecnico/perfil", label: "Perfil de usuario", icon: User }
  ],
  supervisor: [
    { path: "/supervisor", label: "Dashboard", icon: LayoutDashboard },
    { path: "/supervisor/calendario", label: "Calendario", icon: Calendar },
    { path: "/supervisor/validacion", label: "Aprobación", icon: ClipboardList },
    {
      label: "Mantenimiento",
      icon: Wrench,
      children: [
        { path: "/supervisor/asignar-ordenes", label: "Asignar Órdenes", icon: UserCheck },
        { path: "/supervisor/validacion", label: "Validar Mantenimientos", icon: ClipboardList }
      ]
    },
    { path: "/supervisor/perfil", label: "Perfil de usuario", icon: User }
  ],
  esmp: [
    { path: "/esmp", label: "Dashboard", icon: LayoutDashboard },
    { path: "/esmp/calendario", label: "Calendario", icon: Calendar },
    {
      label: "Mantenimiento",
      icon: Wrench,
      children: [
        { path: "/esmp/asignar-ordenes", label: "Asignar Órdenes", icon: UserCheck }
      ]
    },
    {
      label: "Gestión de Equipos",
      icon: MonitorDot,
      children: [
        { path: "/esmp/equipos", label: "Registrar Equipos", icon: ClipboardList },
        { path: "/esmp/lista-equipos", label: "Lista de Equipos", icon: Wrench },
      ]
    },
    { path: "/esmp/planificar", label: "Aprobación", icon: Settings },
    { path: "/esmp/usuarios", label: "Gestión de usuarios y equipos", icon: Users },
    { path: "/esmp/reportes", label: "Auditoría y Reportes", icon: FileText },
    { path: "/esmp/perfil", label: "Perfil de usuario", icon: User }
  ],
  responsable_institucional: [
    { path: "/responsable", label: "Dashboard", icon: LayoutDashboard },
    { path: "/responsable/calendario", label: "Calendario", icon: Calendar },
    { path: "/responsable/reportes", label: "Auditoría y Reportes", icon: FileText },
    { path: "/responsable/auditoria", label: "Aprobación", icon: ClipboardList },
    { path: "/responsable/usuarios", label: "Gestión de usuarios y equipos", icon: Users },
    { path: "/responsable/planificar", label: "Planificación", icon: ClipboardList },
    {
      label: "Mantenimiento",
      icon: Wrench,
      children: [
        { path: "/responsable/reportes", label: "Ejecutar Mantenimiento", icon: ClipboardList },
        { path: "/responsable/asignar-ordenes", label: "Asignar Órdenes", icon: UserCheck },
        { path: "/responsable/validacion", label: "Validar Mantenimientos", icon: ClipboardList }
      ]
    },
    { path: "/responsable/perfil", label: "Perfil de usuario", icon: User }
  ]
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const rol = user?.rol_nombre;

  const items = menuPorRol[rol] || [];
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#111A3A] text-white min-h-screen flex flex-col justify-between p-4">
      <div>
        <div className="flex justify-center mb-6">
          <img src={logo} alt="HOSDIP" className="w-auto h-20 object-contain" />
        </div>
        <ul className="space-y-2">
          {items.map((item) => {
            if (item.children) {
              const isOpen = openSubmenus[item.label];
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[#1a2554]"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <ul className="ml-5 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                              location.pathname === child.path
                                ? "bg-[#D0FF34] text-[#111A3A] font-semibold"
                                : "hover:bg-[#1a2554]"
                            }`}
                          >
                            <child.icon size={16} />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.path}>
                <Link
                  to={item.path || "/"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    location.pathname === item.path
                      ? "bg-[#D0FF34] text-[#111A3A] font-semibold"
                      : "hover:bg-[#1a2554]"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm ">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#D0FF34] text-sm hover:underline"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
        <p className="text-xs text-gray-400">Versión 1.0.0</p>
      </div>
    </div>
  );
}
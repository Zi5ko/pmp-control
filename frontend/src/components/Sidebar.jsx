// frontend/src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  MonitorDot,
  Users,
  UserCheck,
  ClockIcon,
  Calendar,
  Settings,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import logo from "../assets/hosdip logo_Logo Original Blanco.png";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const rolId = Number(user?.rol_id); // 1=admin, 2=técnico, 3=supervisor, 4=responsable institucional, 6=esmp

  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      path: `/${user?.rol_nombre}`,
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [1, 2, 3, 4, 6],
    },
    {
      label: "Gestión de Equipos",
      icon: MonitorDot,
      roles: [1, 6],
      children: [
        { path: `/${user?.rol_nombre}/equipos`, label: "Registrar Equipos", icon: ClipboardList, roles: [1, 6] },
        { path: `/${user?.rol_nombre}/lista-equipos`, label: "Lista de Equipos", icon: Wrench, roles: [1, 6] },
      ]
    },
    {
      path: `/${user?.rol_nombre}/planificacion`,
      label: "Planificación de Mantenimientos",
      icon: Calendar,
      roles: [1, 4, 6]
    },
    {
      label: "Mantenimiento",
      icon: Wrench,
      roles: [1, 2, 3, 4, 6],
      children: [
        { path: `/${user?.rol_nombre}/asignar-ordenes`, label: "Asignar Órdenes", icon: UserCheck, roles: [1, 3, 4, 6] },
        { path: `/${user?.rol_nombre}/reportes`, label: "Ejecutar Mantenimiento", icon: ClipboardList, roles: [1, 4] },
        { path: `/${user?.rol_nombre}/validacion`, label: "Validar Mantenimientos", icon: ClipboardList, roles: [1, 3, 4] },
        { path: `/${user?.rol_nombre}/registros-firmas`, label: "Registros y Firmas", icon: FileText, roles: [1, 2] },
        { path: `/${user?.rol_nombre}/historial`, label: "Historial Técnico", icon: ClockIcon, roles: [1, 2] },
      ]
    },
    {
      path: `/${user?.rol_nombre}/alertas`,
      label: "Alertas Automáticas",
      icon: Settings,
      roles: [1, 6]
    },
    {
      path: `/${user?.rol_nombre}/usuarios`,
      label: "Gestión de Usuarios y Roles",
      icon: Users,
      roles: [1, 4, 6]
    },
    {
      path: `/${user?.rol_nombre}/auditoria`,
      label: "Auditoría de Registros",
      icon: FileText,
      roles: [1, 4, 6]
    },
    {
      path: `/${user?.rol_nombre}/perfil`,
      label: "Perfil de Usuario",
      icon: User,
      roles: [1, 2, 3, 4, 6]
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(rolId));

  return (
    <div className="w-64 bg-[#111A3A] text-white min-h-screen flex flex-col justify-between p-4">
      <div>
        <div className="flex justify-center mb-6">
          <img src={logo} alt="HOSDIP" className="w-auto h-20 object-contain" />
        </div>
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            if (item.children) {
              const visibleChildren = item.children.filter(child => child.roles.includes(rolId));
              if (visibleChildren.length === 0) return null;

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
                      {visibleChildren.map((child) => (
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
                  to={item.path}
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
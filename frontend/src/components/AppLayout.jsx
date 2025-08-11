import { Link, Outlet } from "react-router-dom";

export default function AppLayout(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
        <div className="font-semibold">PMP Control</div>
        <nav className="flex gap-4 text-sm">
          <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
          <Link to="/ordenes" className="hover:text-brand-600">Órdenes</Link>
          <Link to="/calendario" className="hover:text-brand-600">Calendario</Link>
        </nav>
      </header>

      <div className="grid grid-cols-[240px_1fr]">
        <aside className="hidden md:block border-r bg-white p-4">
          <div className="text-xs uppercase text-gray-500 mb-2">Módulos</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="block rounded px-2 py-1 hover:bg-gray-100">Dashboard</Link></li>
            <li><Link to="/ordenes" className="block rounded px-2 py-1 hover:bg-gray-100">Órdenes</Link></li>
            <li><Link to="/calendario" className="block rounded px-2 py-1 hover:bg-gray-100">Calendario</Link></li>
          </ul>
        </aside>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
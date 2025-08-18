import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function LayoutBase() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-10 py-6 bg-gray-50 min-h-screen max-w-screen-xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
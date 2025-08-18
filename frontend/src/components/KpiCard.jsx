// src/components/KpiCard.jsx
import { ArrowUpRight } from "lucide-react";

export default function KpiCard({ value, label, Icon, color = "#111A3A" }) {
  return (
    <div className="relative bg-white rounded-2xl shadow p-6 h-40 overflow-hidden">
      <div className="absolute top-4 right-4 text-[#111A3A]">
        <ArrowUpRight size={18} />
      </div>

      <div className="z-10 relative">
        <p className="text-3xl font-bold text-[#111A3A]">{value}</p>
        <p className="text-sm text-[#111A3A] mt-1">{label}</p>
      </div>

      <div className="absolute -bottom-6 -right-6 opacity-10 text-[#111A3A]">
        <Icon size={100} />
      </div>
    </div>
  );
}
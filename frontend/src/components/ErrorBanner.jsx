// frontend/src/components/ErrorBanner.jsx
import { X } from "lucide-react";

export default function ErrorBanner({ title = "Error", message, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-50 bg-white border-l-8 border-red-600 shadow-xl rounded-2xl w-[320px] p-5 text-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm mt-1 text-gray-600">{message}</p>
        </div>
        <button
            onClick={onClose} 
            className="absolute top-3 right-3 rounded-full border border-gray-300 p-1 hover:bg-gray-100 transition"
            aria-label="Cerrar"
            >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
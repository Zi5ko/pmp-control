// src/components/FloatingBanner.jsx
export default function FloatingBanner({ titulo, mensaje, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
        {titulo && <h2 className="text-lg font-bold text-[#111A3A] mb-2">{titulo}</h2>}
        <p className="text-sm text-gray-700 mb-6">{mensaje}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-[#D0FF34] text-[#111A3A] font-semibold rounded hover:bg-lime-300 text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
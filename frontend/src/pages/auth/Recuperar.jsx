// src/pages/auth/Recuperar.jsx

export default function Recuperar() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4">Recuperar Contraseña</h1>
          <form>
            <label className="block mb-2">
              Correo electrónico:
              <input
                type="email"
                className="mt-1 w-full p-2 border rounded"
                placeholder="correo@hospital.cl"
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Enviar enlace de recuperación
            </button>
          </form>
        </div>
      </div>
    );
  }
  
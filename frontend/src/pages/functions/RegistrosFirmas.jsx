//frontend/src/pages/functions/RegistrosFirmas.jsx
import { useEffect, useState } from "react";
import { getOrdenesValidadas, generarPDF } from "../../services/reportesService"; // servicios API
import FirmaDibujo from "../../components/FirmaDibujo"; // componente para dibujar firma
import FirmaCargada from "../../components/FirmaCargada"; // componente para firma guardada
import { Button } from "../../components/Button"; // botón estilizado

export default function RegistrosYFirmas() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [firmaServicio, setFirmaServicio] = useState(null);
  const [firmaTecnico, setFirmaTecnico] = useState(null);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    async function fetchOrdenes() {
      const data = await getOrdenesValidadas();
      setOrdenes(data);
    }
    fetchOrdenes();
  }, []);

  const generarReporte = async () => {
    if (!firmaServicio || !firmaTecnico || !ordenSeleccionada) return;
    setGenerando(true);
    try {
      await generarPDF(ordenSeleccionada.id, {
        firmaServicio,
        firmaTecnico
      });
      alert("Reporte generado exitosamente.");
      setOrdenSeleccionada(null);
      setFirmaServicio(null);
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Error al generar reporte.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-[#111A3A]">Registros y Firmas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-2">Órdenes validadas</h3>
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className={`p-2 border rounded cursor-pointer ${ordenSeleccionada?.id === orden.id ? "bg-blue-100" : ""}`}
              onClick={() => setOrdenSeleccionada(orden)}
            >
              <p><strong>Equipo:</strong> {orden.equipo_nombre}</p>
              <p><strong>Fecha:</strong> {orden.fecha_ejecucion?.slice(0, 10)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          {ordenSeleccionada ? (
            <>
              <h3 className="text-lg font-bold mb-2">Firmas</h3>
              <div className="mb-4">
                <p className="text-sm mb-1 font-medium">Firma usuario servicio clínico</p>
                <FirmaDibujo onSave={setFirmaServicio} />
              </div>
              <div className="mb-4">
                <p className="text-sm mb-1 font-medium">Tu firma (técnico)</p>
                <FirmaDibujo onSave={setFirmaTecnico} />
              </div>
              <Button disabled={generando} onClick={generarReporte}>
                {generando ? "Generando..." : "Generar reporte firmado"}
              </Button>
            </>
          ) : (
            <p className="text-gray-600 text-sm">Selecciona una orden para firmar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
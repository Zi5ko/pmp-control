// frontend/src/pages/functions/Alertas.jsx
import { useEffect, useState } from 'react';
import { obtenerAlertas } from '../../services/alertasService';
import { Card, CardContent } from "../../components/ui/Card";

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerAlertas();
        setAlertas(data);
      } catch (error) {
        console.error('Error al obtener alertas:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Alertas del sistema</h2>
      {alertas.length === 0 ? (
        <p className="text-gray-500">No hay alertas registradas.</p>
      ) : (
        <div className="grid gap-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id}>
              <CardContent className="p-4">
                <p className="font-bold text-red-600">{alerta.mensaje}</p>
                <p className="text-sm text-gray-500">
                  Equipo ID: {alerta.equipo_id || 'N/A'} • Fecha: {new Date(alerta.generada_en).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alertas;
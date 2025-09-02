// src/components/FirmaDibujo.jsx
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { Button } from "../components/Button";

export default function FirmaDibujo({ onSave }) {
  const sigCanvas = useRef();

  const guardarFirma = () => {
    const dataURL = sigCanvas.current.toDataURL();
    onSave(dataURL);
  };

  const limpiarFirma = () => {
    sigCanvas.current.clear();
    onSave(null);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
        <SignatureCanvas
          penColor="black"
          canvasProps={{ className: "w-full h-32 rounded-lg cursor-crosshair" }}
          ref={sigCanvas}
        />
      </div>
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          onClick={guardarFirma}
          className="px-4 py-1.5 text-sm"
        >
          Guardar
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={limpiarFirma}
          className="px-4 py-1.5 text-sm"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
}
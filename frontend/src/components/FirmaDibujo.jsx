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
    <div className="space-y-2">
      <SignatureCanvas
        penColor="black"
        canvasProps={{ className: "border w-full h-32 rounded" }}
        ref={sigCanvas}
      />
      <div className="flex gap-2">
        <Button type="button" onClick={guardarFirma}>
          Guardar
        </Button>
        <Button variant="outline" type="button" onClick={limpiarFirma}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
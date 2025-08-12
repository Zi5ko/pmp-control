import { useEffect, useState } from "react";
import "../../styles/login.css"; // Reutiliza tu CSS

export default function InicioAdmin() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then(setUsuarios)
      .catch((err) => console.error("Error al cargar usuarios", err));
  }, []);

  return (
    <div className="login-wrap">
      <div className="login-card" style={{ maxWidth: 1000 }}>
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>Panel de Administración</h1>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button className="btn btn-primary">+ Crear Usuario</button>
        </div>

        <table className="login-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={estiloColumna}>ID</th>
              <th style={estiloColumna}>Nombre</th>
              <th style={estiloColumna}>Correo</th>
              <th style={estiloColumna}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={estiloCelda}>{u.id}</td>
                <td style={estiloCelda}>{u.nombre}</td>
                <td style={estiloCelda}>{u.email}</td>
                <td style={estiloCelda}>{rolNombre(u.rol_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const estiloColumna = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold"
};

const estiloCelda = {
  padding: "10px"
};

function rolNombre(id) {
  const mapa = {
    1: "Administrador",
    2: "Técnico",
    3: "Supervisor",
    4: "Calidad",
    5: "Responsable Institucional",
    6: "ESMP"
  };
  return mapa[id] || "Desconocido";
}

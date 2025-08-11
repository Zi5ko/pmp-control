import { useAuth } from '../auth/AuthContext.jsx';

export default function Calendario() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Calendario (protegido)</h2>
      <p>Hola, {user?.nombre || user?.email}</p>
      <button onClick={logout}>Salir</button>
    </div>
  );
}

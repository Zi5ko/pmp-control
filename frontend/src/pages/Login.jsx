import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo-hosdip.jpeg";
import GoogleButton from "../components/GoogleButton";
import InputField from "../components/InputField";
import "../styles/login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email,
        password: pass
      }, {
        withCredentials: true  // ⬅️ permite recibir y guardar la cookie
      });
      window.location.href = "/";      
    } catch (e) {
      setErr(e?.response?.data?.error || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <img src={logo} alt="HOSDIP" />
          <h1>PMP Control</h1>
          <p className="subtitle">Acceso seguro a la plataforma</p>
        </div>

        {err ? <div className="alert">{err}</div> : null}

        <form onSubmit={handleSubmit} className="form">
          <InputField
            label="Correo institucional"
            type="email"
            placeholder="nombre@hospital.cl"
            value={email}
            onChange={(v) => setEmail(v)}
            icon="mail"
            autoComplete="email"
            autoFocus
          />
          <InputField
            label="Contraseña"
            type="password"
            placeholder="********"
            value={pass}
            onChange={(v) => setPass(v)}
            icon="lock"
            autoComplete="current-password"
          />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="divider"><span>o</span></div>

        <GoogleButton text="Continuar con Google" />

        <p className="footnote">
          ¿Olvidaste tu contraseña? <a href="/recuperar">Recupérala aquí</a>
        </p>
      </div>
      <footer className="login-foot">© {new Date().getFullYear()} Hospital DIPRECA</footer>
    </div>
  );
}
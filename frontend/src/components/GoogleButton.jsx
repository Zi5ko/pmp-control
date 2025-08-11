import "../styles/google-btn.css";

export default function GoogleButton({ text = "Sign in with Google" }) {
  const GOOGLE_START = `${import.meta.env.VITE_API_URL}/auth/google`;
  return (
    <a className="btn btn-google" href={GOOGLE_START}>
      <span className="g-logo" aria-hidden="true"></span>
      {text}
    </a>
  );
}
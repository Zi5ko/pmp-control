const API = import.meta.env.VITE_API_URL;

async function checkHealth() {
  try {
    const r = await fetch(`${API}/health`, { credentials: 'include' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return data.ok === true;
  } catch (e) {
    console.error('health error:', e);
    return false;
  }
}
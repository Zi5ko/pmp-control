const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
const evidenciasRoutes = require('./routes/evidenciasRoutes');

const app = express();

//Middlewares base
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Middleware para manejar cookies
app.use(cookieParser());

//Passport
const initPassport = require('./config/passport');
initPassport(passport);
app.use(passport.initialize());

//Rutas
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/ordenes', require('./routes/ordenesRoutes'));
app.use('/api/planes', require('./routes/planesRoutes'));
app.use('/api/equipos', require('./routes/equiposRoutes'));
app.use('/api/evidencias', evidenciasRoutes);


//Manejo de errores básico
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

//Ruta de prueba
app.get('/', (_req, res) => res.send('API OK'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'api', time: new Date().toISOString() });
  });

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

app.use('/api', require('./routes/healthRoutes'));

// Middleware para servir archivos estáticos de la carpeta "uploads"
app.use('/uploads', express.static('uploads'));

// Exportar la aplicación para usarla en otros archivos
module.exports = app;
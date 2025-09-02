//server/index_app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
const evidenciasRoutes = require('./routes/evidenciasRoutes');
const app = express();
const path = require('path');

//Middlewares base
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/roles', require('./routes/rolesRoutes'));


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
const { authUploads } = require('./middlewares/auth');
// Permite acceso público a los reportes
app.use('/uploads/reportes', express.static(path.join(__dirname, 'uploads', 'reportes')));
app.use('/uploads/evidencias', express.static(path.join(__dirname, 'uploads', 'evidencias')));
// Mantén autenticado el acceso a otras evidencias si lo necesitas
app.use('/uploads', authUploads, express.static(path.join(__dirname, 'uploads')));

// Rutas para manejar firmas
const firmasRoutes = require('./routes/firmasRoutes');
app.use('/api/firmas', firmasRoutes);

// Rutas para manejar alertas
app.use('/api/alertas', require('./routes/alertasRoutes'));

// Rutas para manejar logs de auditoría
const logsRoutes = require('./routes/logsRoutes');
app.use('/api/logs', logsRoutes);

// Rutas para manejar reportes
const reportesRoutes = require("./routes/reportesRoutes");
app.use("/api/reportes", reportesRoutes);

// Exportar la aplicación para usarla en otros archivos
module.exports = app;
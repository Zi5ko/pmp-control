const express = require('express');
const pool = require('./db');
const usuariosRoutes = require('./routes/usuariosRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api', usuariosRoutes); // Conecta el login
app.use('/api', ordenesRoutes); // Conecta las órdenes

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Hora actual en la BD: ${result.rows[0].now}`);
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    res.status(500).send('Error al acceder a la base de datos');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

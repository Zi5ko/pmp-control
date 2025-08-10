const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Tablas creadas exitosamente en Supabase');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al ejecutar init.sql:', err.message);
    process.exit(1);
  }
})();

const dns = require('dns');
const { Pool } = require('pg');
require('dotenv').config();

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

function getConfiguredConnectionString() {
  return process.env.SUPABASE_POOLER_URL
    || process.env.DATABASE_POOL_URL
    || process.env.DATABASE_URL
    || null;
}

function buildConnectionString() {
  const configuredConnectionString = getConfiguredConnectionString();
  if (configuredConnectionString) {
    return configuredConnectionString;
  }

  const {
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE
  } = process.env;

  if (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD || !PGDATABASE) {
    return null;
  }

  const encodedUser = encodeURIComponent(PGUSER);
  const encodedPassword = encodeURIComponent(PGPASSWORD);
  const encodedDatabase = encodeURIComponent(PGDATABASE);

  return `postgresql://${encodedUser}:${encodedPassword}@${PGHOST}:${PGPORT}/${encodedDatabase}`;
}

function shouldUseSsl(connectionString) {
  if (!connectionString) return false;

  try {
    const { hostname } = new URL(connectionString);
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  } catch (_error) {
    return true;
  }
}

function isDirectSupabaseHost(connectionString) {
  if (!connectionString) return false;

  try {
    const { hostname } = new URL(connectionString);
    return /^db\.[^.]+\.supabase\.co$/i.test(hostname);
  } catch (_error) {
    return false;
  }
}

const connectionString = buildConnectionString();

if (!connectionString) {
  console.warn('PostgreSQL connection variables are missing. Expected SUPABASE_POOLER_URL, DATABASE_POOL_URL, DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.');
}

if (isDirectSupabaseHost(connectionString)) {
  console.warn('Detected a direct Supabase database host (db.<project-ref>.supabase.co). This endpoint is IPv6-only by default; on Railway use the Supavisor session pooler connection string or enable the Supabase IPv4 add-on.');
}

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl(connectionString)
    ? { rejectUnauthorized: false }
    : false
});


async function ensureOrdenesEstadoConstraint() {
  if (!connectionString) {
    return;
  }

  try {
    await pool.query(`
      ALTER TABLE ordenes_trabajo
      DROP CONSTRAINT IF EXISTS ordenes_trabajo_estado_check
    `);

    await pool.query(`
      ALTER TABLE ordenes_trabajo
      ADD CONSTRAINT ordenes_trabajo_estado_check
      CHECK (estado IN ('pendiente', 'asignada', 'realizada', 'reprogramada', 'omitida', 'validada', 'firmada'))
    `);
  } catch (error) {
    if (error.code === '42P01') {
      return;
    }

    console.error('No se pudo sincronizar la restricción de estados de ordenes_trabajo:', error.message);
  }
}
void ensureOrdenesEstadoConstraint();

module.exports = pool;

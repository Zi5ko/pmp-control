const { Pool } = require('pg');
require('dotenv').config();

function buildConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
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

const connectionString = buildConnectionString();

if (!connectionString) {
  console.warn('PostgreSQL connection variables are missing. Expected DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.');
}

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl(connectionString)
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL no configurada. Crea backend/.env con tu cadena de Neon/Postgres.');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = pool;

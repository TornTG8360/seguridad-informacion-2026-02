const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');

const authRouter = require('../routes/auth');
const pool = require('../db/pool');

const originalQueries = {
  query: pool.query.bind(pool),
};

async function crearServidor() {
  const app = express();
  app.use(express.json());
  app.use('/api', authRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  return server;
}

test('POST /api/register crea un usuario nuevo con hash', async () => {
  pool.query = async (sql, params) => {
    if (sql.includes('SELECT id FROM roles')) {
      return { rows: [{ id: 2 }] };
    }

    if (sql.includes('INSERT INTO usuarios')) {
      return {
        rowCount: 1,
        rows: [{ id: 1, username: 'nuevo', rol: 'Usuario' }],
      };
    }

    return { rows: [] };
  };

  const server = await crearServidor();

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nuevo', password: 'Clave123!' }),
    });

    const data = await response.json();

    assert.equal(response.status, 201);
    assert.equal(data.username, 'nuevo');
    assert.equal(data.rol, 'Usuario');
  } finally {
    pool.query = originalQueries.query;
    server.close();
  }
});

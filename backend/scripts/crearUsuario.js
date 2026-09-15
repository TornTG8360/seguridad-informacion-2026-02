require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

async function crearUsuario(username, passwordPlano, rolNombre = 'Usuario') {
  const hash = await bcrypt.hash(passwordPlano, 10);
  const { rows } = await pool.query('SELECT id FROM roles WHERE nombre = $1', [rolNombre]);

  if (!rows[0]) {
    throw new Error(`Rol no encontrado: ${rolNombre}`);
  }

  await pool.query(
    'INSERT INTO usuarios (username, password_hash, rol_id) VALUES ($1, $2, $3)',
    [username, hash, rows[0].id]
  );

  console.log(`Usuario ${username} creado.`);
  process.exit(0);
}

crearUsuario(process.argv[2], process.argv[3], process.argv[4]);

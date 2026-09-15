const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const middlewareProteccionFuerzaBruta = require('../middleware/antiForceBruta');

const router = express.Router();

router.post('/register', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const rolNombre = String(req.body?.rol || 'Usuario').trim() || 'Usuario';

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    const existeUsuario = await pool.query(
      'SELECT id FROM usuarios WHERE username = $1',
      [username]
    );

    if (existeUsuario.rows.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
    }

    const { rows: rolRows } = await pool.query(
      'SELECT id FROM roles WHERE nombre = $1',
      [rolNombre]
    );

    if (rolRows.length === 0) {
      return res.status(400).json({ error: `El rol ${rolNombre} no existe.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (username, password_hash, rol_id) VALUES ($1, $2, $3) RETURNING id, username, rol_id',
      [username, passwordHash, rolRows[0].id]
    );

    const usuarioCreado = rows?.[0];

    return res.status(201).json({
      id: usuarioCreado?.id ?? null,
      username: usuarioCreado?.username ?? username,
      rol: usuarioCreado?.rol ?? rolNombre,
    });
  } catch (error) {
    const isDbConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'].includes(error?.code);

    if (isDbConnectionError || !process.env.DATABASE_URL) {
      console.error('Error de conexión a la base de datos:', error?.message || error);
      return res.status(503).json({
        error: 'La base de datos no está disponible. Configura DATABASE_URL en backend/.env con la cadena correcta de Neon/Postgres.',
      });
    }

    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.post('/login', middlewareProteccionFuerzaBruta, async (req, res) => {
  const { username, password } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.password_hash, u.intentos_fallidos, u.bloqueado_hasta, r.nombre AS rol
       FROM usuarios u JOIN roles r ON u.rol_id = r.id
       WHERE u.username = $1`,
      [username]
    );

    if (rows.length === 0) {
      req.registroIP.conteo += 1;
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const usuario = rows[0];

    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return res.status(429).json({ error: 'Cuenta bloqueada temporalmente por intentos fallidos.' });
    }

    const esValido = await bcrypt.compare(password, usuario.password_hash);

    if (!esValido) {
      req.registroIP.conteo += 1;
      const nuevosIntentos = usuario.intentos_fallidos + 1;
      let bloqueadoHasta = null;

      if (nuevosIntentos >= req.MAX_INTENTOS) {
        bloqueadoHasta = new Date(Date.now() + req.VENTANA_TIEMPO);
        req.registroIP.bloqueadoHasta = bloqueadoHasta.getTime();
      }

      await pool.query(
        `UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = $2 WHERE id = $3`,
        [nuevosIntentos, bloqueadoHasta, usuario.id]
      );

      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    await pool.query(
      `UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1`,
      [usuario.id]
    );
    req.registroIP.conteo = 0;

    return res.json({ id: usuario.id, username: usuario.username, rol: usuario.rol });
  } catch (error) {
    const isDbConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'].includes(error?.code);

    if (isDbConnectionError || !process.env.DATABASE_URL) {
      console.error('Error de conexión a la base de datos:', error?.message || error);
      return res.status(503).json({
        error: 'La base de datos no está disponible. Configura DATABASE_URL en backend/.env con la cadena correcta de Neon/Postgres.',
      });
    }

    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;

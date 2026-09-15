const test = require('node:test');
const assert = require('node:assert/strict');

test('falla con un mensaje claro cuando DATABASE_URL no está configurada', () => {
  const dotenvPath = require.resolve('dotenv');
  const poolPath = require.resolve('../db/pool');
  const originalEnv = process.env.DATABASE_URL;
  const originalConsoleError = console.error;
  const originalDotenv = require.cache[dotenvPath];
  const messages = [];

  delete process.env.DATABASE_URL;
  delete require.cache[poolPath];
  require.cache[dotenvPath] = {
    exports: {
      config: () => ({ parsed: {} }),
    },
  };
  console.error = (...args) => messages.push(args.join(' '));

  try {
    const poolModule = require(poolPath);
    assert.ok(poolModule && poolModule.query, 'Debe crear un pool válido aunque no exista DATABASE_URL');
    assert.ok(
      messages.some((msg) => msg.includes('DATABASE_URL no configurada')),
      'Debe registrar un aviso claro cuando falta la variable de entorno'
    );
  } finally {
    console.error = originalConsoleError;

    if (originalEnv === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalEnv;
    }

    delete require.cache[poolPath];
    if (originalDotenv) {
      require.cache[dotenvPath] = originalDotenv;
    } else {
      delete require.cache[dotenvPath];
    }
  }
});

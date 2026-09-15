const test = require('node:test');
const assert = require('node:assert/strict');

const middlewareProteccionFuerzaBruta = require('../middleware/antiForceBruta');

function crearRespuesta() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('bloquea una IP cuando ya tiene un bloqueo vigente', () => {
  const ip = '203.0.113.10';
  const req = {
    ip,
    socket: { remoteAddress: ip },
  };
  const res = crearRespuesta();

  const map = middlewareProteccionFuerzaBruta.__intentosIP;
  map.set(ip, {
    conteo: 5,
    primerIntento: Date.now() - 1000,
    bloqueadoHasta: Date.now() + 30000,
  });

  middlewareProteccionFuerzaBruta(req, res, () => {
    assert.fail('No debería continuar al siguiente middleware cuando la IP está bloqueada');
  });

  assert.equal(res.statusCode, 429);
  assert.match(res.payload.error, /Demasiados intentos/);
});

test('permite continuar si la IP no está bloqueada', () => {
  const ip = '203.0.113.11';
  const req = {
    ip,
    socket: { remoteAddress: ip },
  };
  const res = crearRespuesta();

  const map = middlewareProteccionFuerzaBruta.__intentosIP;
  map.delete(ip);

  let pasoSiguiente = false;
  middlewareProteccionFuerzaBruta(req, res, () => {
    pasoSiguiente = true;
  });

  assert.equal(pasoSiguiente, true);
  assert.equal(req.MAX_INTENTOS, 5);
  assert.equal(req.VENTANA_TIEMPO, 15 * 60 * 1000);
});

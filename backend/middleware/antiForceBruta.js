const intentosIP = new Map();
const MAX_INTENTOS = 5;
const VENTANA_TIEMPO = 15 * 60 * 1000;

function middlewareProteccionFuerzaBruta(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const ahora = Date.now();

  if (!intentosIP.has(ip)) {
    intentosIP.set(ip, { conteo: 0, primerIntento: ahora, bloqueadoHasta: 0 });
  }

  const registro = intentosIP.get(ip);

  if (registro.bloqueadoHasta > ahora) {
    const segundosRestantes = Math.ceil((registro.bloqueadoHasta - ahora) / 1000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Intente de nuevo en ${segundosRestantes} segundos.`,
    });
  }

  if (ahora - registro.primerIntento > VENTANA_TIEMPO) {
    registro.conteo = 0;
    registro.primerIntento = ahora;
  }

  req.registroIP = registro;
  req.MAX_INTENTOS = MAX_INTENTOS;
  req.VENTANA_TIEMPO = VENTANA_TIEMPO;
  next();
}

module.exports = middlewareProteccionFuerzaBruta;
module.exports.__intentosIP = intentosIP;

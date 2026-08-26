const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
const LONGITUD_MINIMA = 10

const limpiarTexto = (texto) =>
  texto
    .toUpperCase()
    .replace(/Ñ/g, '§')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/§/g, 'Ñ')
    .split('')
    .filter((caracter) => ALFABETO.includes(caracter))
    .join('')

const normalizarDesplazamiento = (valor) => {
  const valorNumerico = Number(valor)

  if (!Number.isFinite(valorNumerico)) {
    return 0
  }

  const valorNormalizado = valorNumerico % ALFABETO.length
  return valorNormalizado < 0 ? valorNormalizado + ALFABETO.length : valorNormalizado
}

const desplazarCaracter = (caracter, desplazamiento) => {
  const posicion = ALFABETO.indexOf(caracter)
  const posicionDesplazada = (posicion + desplazamiento) % ALFABETO.length
  return ALFABETO[posicionDesplazada]
}

const transformarTexto = (texto, desplazamiento) => {
  const textoLimpio = limpiarTexto(texto)
  const desplazamientoNormalizado = normalizarDesplazamiento(desplazamiento)

  return [...textoLimpio]
    .map((caracter) => desplazarCaracter(caracter, desplazamientoNormalizado))
    .join('')
}

const fuerzaBruta = (texto) =>
  Array.from({ length: ALFABETO.length }, (_, clave) => ({
    clave,
    texto: transformarTexto(texto, -clave),
  }))

export const cifradoCesar = {
  id: 'caesar',
  name: 'César',
  limpiar: limpiarTexto,
  options: {
    requiresShift: true,
    alphabet: ALFABETO,
    minLength: LONGITUD_MINIMA,
  },
  cifrar: (texto, desplazamiento) => transformarTexto(texto, desplazamiento),
  descifrar: (texto, desplazamiento) => transformarTexto(texto, -desplazamiento),
  fuerzaBruta,
}

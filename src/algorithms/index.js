import { cifradoCesar } from './caesarCipher'

export const algoritmos = [cifradoCesar]

export const obtenerAlgoritmoPorId = (idAlgoritmo) =>
  algoritmos.find((algoritmo) => algoritmo.id === idAlgoritmo) ?? algoritmos[0]

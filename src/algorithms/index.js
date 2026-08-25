import { caesarCipher } from './caesarCipher'

export const algorithms = [caesarCipher]

export const getAlgorithmById = (algorithmId) =>
  algorithms.find((algorithm) => algorithm.id === algorithmId) ?? algorithms[0]

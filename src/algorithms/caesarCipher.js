const normalizeShift = (value) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return 0
  }

  const normalizedValue = numericValue % 26
  return normalizedValue < 0 ? normalizedValue + 26 : normalizedValue
}

const shiftCharacter = (character, shift) => {
  const code = character.charCodeAt(0)

  if (code >= 65 && code <= 90) {
    const shifted = ((code - 65 + shift) % 26) + 65
    return String.fromCharCode(shifted)
  }

  if (code >= 97 && code <= 122) {
    const shifted = ((code - 97 + shift) % 26) + 97
    return String.fromCharCode(shifted)
  }

  return character
}

const transformText = (text, shift) => {
  const normalizedShift = normalizeShift(shift)

  return [...text].map((character) => shiftCharacter(character, normalizedShift)).join('')
}

export const caesarCipher = {
  id: 'caesar',
  name: 'César',
  options: {
    requiresShift: true,
  },
  encrypt: (text, shift) => transformText(text, shift),
  decrypt: (text, shift) => transformText(text, -shift),
}

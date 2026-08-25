import { useMemo, useState } from 'react'
import { algorithms, getAlgorithmById } from './algorithms'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(algorithms[0].id)
  const [shift, setShift] = useState(3)
  const [mode, setMode] = useState('encrypt')

  const selectedAlgorithm = getAlgorithmById(selectedAlgorithmId)

  const outputText = useMemo(() => {
    if (!inputText) {
      return ''
    }

    if (mode === 'decrypt') {
      return selectedAlgorithm.decrypt(inputText, shift)
    }

    return selectedAlgorithm.encrypt(inputText, shift)
  }, [inputText, mode, selectedAlgorithm, shift])

  return (
    <main className="app">
      <h1>Cifrador César</h1>
      <p className="subtitle">Cifrado y descifrado con una interfaz simple y extensible.</p>

      <div className="controls">
        <label>
          Algoritmo
          <select
            value={selectedAlgorithmId}
            onChange={(event) => setSelectedAlgorithmId(event.target.value)}
          >
            {algorithms.map((algorithm) => (
              <option key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Modo
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="encrypt">Cifrar</option>
            <option value="decrypt">Descifrar</option>
          </select>
        </label>

        {selectedAlgorithm.options.requiresShift && (
          <label>
            Desplazamiento
            <input
              type="number"
              value={shift}
              onChange={(event) => setShift(event.target.value)}
            />
          </label>
        )}
      </div>

      <div className="panes">
        <label>
          Texto de entrada
          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Escribe texto aquí"
          />
        </label>

        <label>
          Resultado
          <textarea value={outputText} readOnly placeholder="Resultado" />
        </label>
      </div>
    </main>
  )
}

export default App

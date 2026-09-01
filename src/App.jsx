import { useState } from 'react'
import {
  limpiarTexto,
  detectarAlgoritmo,
  cifrarCesar,
  descifrarCesar,
  cifrarAfin,
  descifrarAfin,
  cifrarVigenere,
  descifrarVigenere,
  analizarCesar,
  analizarAfin,
  analizarVigenere,
} from './algorithms'
import './App.css'

const ALGORITMOS = [
  { id: 'cesar', nombre: 'César', descripcion: 'Monoalfabético simple' },
  { id: 'afin', nombre: 'Afín', descripcion: 'Ecuación lineal' },
  { id: 'vigenere', nombre: 'Vigenère', descripcion: 'Polialfabético' },
]

function EncryptMode({ algoritmo, onAlgoritmoChange }) {
  const [textoOriginal, setTextoOriginal] = useState('')
  const [clave, setClave] = useState('')
  const [paramA, setParamA] = useState('5')
  const [paramB, setParamB] = useState('8')
  const [cifrado, setCifrado] = useState('')

  const manejarCifrado = () => {
    const texto = limpiarTexto(textoOriginal)
    if (!texto) {
      alert('Por favor ingresa un texto')
      return
    }

    try {
      let resultado
      if (algoritmo === 'cesar') {
        const claveNum = parseInt(clave) || 0
        resultado = cifrarCesar(texto, claveNum)
      } else if (algoritmo === 'afin') {
        const a = parseInt(paramA) || 1
        const b = parseInt(paramB) || 0
        resultado = cifrarAfin(texto, a, b)
      } else {
        if (!clave.trim()) {
          alert('Por favor ingresa una clave para Vigenère')
          return
        }
        resultado = cifrarVigenere(texto, clave)
      }
      setCifrado(resultado)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="mode-panel">
      <h3>Cifrar</h3>
      <div className="control-group">
        <label>Algoritmo</label>
        <select value={algoritmo} onChange={(e) => onAlgoritmoChange(e.target.value)}>
          {ALGORITMOS.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.nombre} - {algo.descripcion}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Texto original</label>
        <textarea
          value={textoOriginal}
          onChange={(e) => setTextoOriginal(e.target.value)}
          placeholder="Ingresa el texto a cifrar..."
        />
      </div>

      {algoritmo === 'cesar' && (
        <div className="control-group">
          <label>Desplazamiento (0-26)</label>
          <input
            type="number"
            min="0"
            max="26"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej: 3"
          />
        </div>
      )}

      {algoritmo === 'afin' && (
        <>
          <div className="control-group">
            <label>Parámetro a (coprimo con 27)</label>
            <input
              type="number"
              value={paramA}
              onChange={(e) => setParamA(e.target.value)}
              placeholder="Ej: 5"
            />
          </div>
          <div className="control-group">
            <label>Parámetro b</label>
            <input
              type="number"
              value={paramB}
              onChange={(e) => setParamB(e.target.value)}
              placeholder="Ej: 8"
            />
          </div>
        </>
      )}

      {algoritmo === 'vigenere' && (
        <div className="control-group">
          <label>Clave</label>
          <input
            type="text"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej: CLAVE"
          />
        </div>
      )}

      <button onClick={manejarCifrado} className="btn-primary">
        Cifrar
      </button>

      {cifrado && (
        <div className="result-box">
          <label>Texto cifrado</label>
          <textarea readOnly value={cifrado} />
          <button
            className="btn-copy"
            onClick={() => navigator.clipboard.writeText(cifrado)}
          >
            Copiar
          </button>
        </div>
      )}
    </div>
  )
}

function DecryptMode({ algoritmo, onAlgoritmoChange }) {
  const [textoCifrado, setTextoCifrado] = useState('')
  const [clave, setClave] = useState('')
  const [paramA, setParamA] = useState('5')
  const [paramB, setParamB] = useState('8')
  const [descifrado, setDescifrado] = useState('')
  const [diagnostico, setDiagnostico] = useState(null)
  const [algoritmoDetectado, setAlgoritmoDetectado] = useState(null)
  const [confianza, setConfianza] = useState(0)

  const manejarDescifrado = () => {
    const texto = limpiarTexto(textoCifrado)
    if (!texto) {
      alert('Por favor ingresa un texto cifrado')
      return
    }

    if (texto.length < 50) {
      alert('Por favor ingresa al menos 50 caracteres válidos')
      return
    }

    // Detectar algoritmo automáticamente
    const deteccion = detectarAlgoritmo(texto)
    
    // Si es insuficiente pero el usuario seleccionó auto, usar César como default
    let algoritmoUsado = algoritmo === 'auto' 
      ? (deteccion.id === 'insuficiente' ? 'cesar' : deteccion.id) 
      : algoritmo

    setAlgoritmoDetectado(algoritmoUsado)
    setConfianza(deteccion.confianza)

    try {
      let resultado = ''
      let info = null

      if (algoritmoUsado === 'cesar') {
        info = analizarCesar(texto)
        const claveNum = algoritmo === 'auto' ? info.mejorRotacion : (parseInt(clave) || info.mejorRotacion)
        resultado = descifrarCesar(texto, claveNum)
      } else if (algoritmoUsado === 'afin') {
        info = analizarAfin(texto)
        const a = algoritmo === 'auto' ? info.mejorA : (parseInt(paramA) || info.mejorA)
        const b = algoritmo === 'auto' ? info.mejorB : (parseInt(paramB) || info.mejorB)
        resultado = descifrarAfin(texto, a, b)
      } else if (algoritmoUsado === 'vigenere') {
        info = analizarVigenere(texto)
        if (clave.trim()) {
          resultado = descifrarVigenere(texto, clave)
        } else {
          resultado = info.descifrado
          setClave(info.claveEstimada)
        }
      }
      
      setDescifrado(resultado)
      setDiagnostico(info)
    } catch (error) {
      alert('Error al descifrar: ' + error.message)
      console.error(error)
    }
  }

  return (
    <div className="mode-panel">
      <h3>Descifrar</h3>
      <div className="control-group">
        <label>Algoritmo (manual o automático)</label>
        <select value={algoritmo} onChange={(e) => onAlgoritmoChange(e.target.value)}>
          <option value="auto">Detectar automáticamente</option>
          {ALGORITMOS.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Texto cifrado</label>
        <textarea
          value={textoCifrado}
          onChange={(e) => setTextoCifrado(e.target.value)}
          placeholder="Pega el texto cifrado aquí..."
        />
      </div>

      {algoritmo === 'cesar' && (
        <div className="control-group">
          <label>Desplazamiento (0-26)</label>
          <input
            type="number"
            min="0"
            max="26"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej: 3"
          />
        </div>
      )}

      {algoritmo === 'afin' && (
        <>
          <div className="control-group">
            <label>Parámetro a</label>
            <input
              type="number"
              value={paramA}
              onChange={(e) => setParamA(e.target.value)}
              placeholder="Ej: 5"
            />
          </div>
          <div className="control-group">
            <label>Parámetro b</label>
            <input
              type="number"
              value={paramB}
              onChange={(e) => setParamB(e.target.value)}
              placeholder="Ej: 8"
            />
          </div>
        </>
      )}

      {algoritmo === 'vigenere' && (
        <div className="control-group">
          <label>Clave (deja vacío para ataque automático)</label>
          <input
            type="text"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej: CLAVE"
          />
        </div>
      )}

      <button onClick={manejarDescifrado} className="btn-primary">
        Descifrar
      </button>

      {diagnostico && algoritmoDetectado === 'cesar' && (
        <div className="diagnostico-box">
          <h4>Análisis César</h4>
          <div className="info-row">
            <span className="label">Índice de Coincidencia (IC):</span>
            <span className="value">{diagnostico.ic}</span>
            <span className="nota">Esperado: {diagnostico.icEsperado}</span>
          </div>
          <div className="info-row">
            <span className="label">Mejor rotación encontrada:</span>
            <span className="value">k = {diagnostico.mejorRotacion}</span>
            <span className="nota">Chi-cuadrado: {diagnostico.chiCuadrado}</span>
          </div>
          <div className="info-row">
            <span className="label">Método:</span>
            <span className="nota">Fuerza bruta - Prueba de todas las rotaciones posibles</span>
          </div>
        </div>
      )}

      {diagnostico && algoritmoDetectado === 'afin' && (
        <div className="diagnostico-box">
          <h4>Análisis Afín</h4>
          <div className="info-row">
            <span className="label">Índice de Coincidencia (IC):</span>
            <span className="value">{diagnostico.ic}</span>
            <span className="nota">Esperado: {diagnostico.icEsperado}</span>
          </div>
          <div className="info-row">
            <span className="label">Letra más frecuente:</span>
            <span className="value">{diagnostico.letraFrecuente}</span>
          </div>
          <div className="info-row">
            <span className="label">Mejor pareja de parámetros:</span>
            <span className="value">a = {diagnostico.mejorA}, b = {diagnostico.mejorB}</span>
            <span className="nota">Chi-cuadrado: {diagnostico.chiCuadrado}</span>
          </div>
          <div className="info-row">
            <span className="label">Método:</span>
            <span className="nota">Resolución de ecuación lineal - Se buscan parejas válidas (a, b)</span>
          </div>

          {diagnostico.frecuencias && diagnostico.frecuencias.length > 0 && (
            <div className="frecuencias-section">
              <h5>Análisis de Frecuencia de Letras</h5>
              <table className="frecuencias-table">
                <thead>
                  <tr>
                    <th>Letra</th>
                    <th>Frecuencia</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostico.frecuencias.map((freq, idx) => (
                    <tr key={idx} className={idx === 0 ? 'highlight-row' : ''}>
                      <td className="letra-cell"><strong>{freq.letra}</strong></td>
                      <td>{freq.cantidad}</td>
                      <td>{freq.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="nota-frecuencias">Los datos se calculan sobre el texto descifrado. La letra destacada es la más frecuente.</p>
            </div>
          )}
        </div>
      )}

      {diagnostico && algoritmoDetectado === 'vigenere' && (
        <div className="diagnostico-box">
          <h4>Análisis Vigenère</h4>
          <div className="info-row">
            <span className="label">Índice de Coincidencia (IC):</span>
            <span className="value">{diagnostico.ic}</span>
            <span className="nota">Esperado: {diagnostico.icEsperado} - IC bajo detectado ✓</span>
          </div>
          <div className="info-row">
            <span className="label">Longitud de clave sugerida:</span>
            <span className="value">{diagnostico.longitudSugerida}</span>
            <span className="nota">IC en columnas: {diagnostico.icPorColumnas}</span>
          </div>
          <div className="info-row">
            <span className="label">Clave estimada (Kasiski):</span>
            <span className="value">{diagnostico.claveEstimada}</span>
            <span className="nota">Encontradas {diagnostico.repeticiones} repeticiones de trigramas</span>
          </div>
          <div className="info-row">
            <span className="label">Método:</span>
            <span className="nota">Kasiski - Análisis de repeticiones y análisis de frecuencias por columna</span>
          </div>
        </div>
      )}

      {descifrado && (
        <div className="result-box">
          <div className="result-header">
            <strong>Algoritmo:</strong> {ALGORITMOS.find((a) => a.id === algoritmoDetectado)?.nombre}
            <span className="confidence">Confianza: {confianza}%</span>
          </div>
          <label>Texto descifrado</label>
          <textarea readOnly value={descifrado} />
          <button
            className="btn-copy"
            onClick={() => navigator.clipboard.writeText(descifrado)}
          >
            Copiar
          </button>
        </div>
      )}
    </div>
  )
}

function App() {
  const [sidebarAbierta, setSidebarAbierta] = useState(true)
  const [modo, setModo] = useState('cifrar')
  const [algoritmo, setAlgoritmo] = useState('cesar')

  return (
    <main className="app-shell">
      <div className={`sidebar ${sidebarAbierta ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarAbierta && (
            <div className="sidebar-title">
              <h1>Cifrado Clásico</h1>
              <p className="sidebar-author">Daniel Sebastián Castro Figueredo</p>
              <p className="sidebar-subject">Seguridad de la Información 2026</p>
            </div>
          )}
          <button
            className="toggle-btn"
            onClick={() => setSidebarAbierta(!sidebarAbierta)}
            aria-label="Toggle sidebar"
            title={sidebarAbierta ? 'Cerrar menú' : 'Abrir menú'}
          >
            ☰
          </button>
        </div>

        {sidebarAbierta && (
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3>Modo</h3>
              <button
                className={`nav-btn ${modo === 'cifrar' ? 'active' : ''}`}
                onClick={() => setModo('cifrar')}
              >
                Cifrar
              </button>
              <button
                className={`nav-btn ${modo === 'descifrar' ? 'active' : ''}`}
                onClick={() => setModo('descifrar')}
              >
                Descifrar
              </button>
            </div>

            <div className="nav-section">
              <h3>Algoritmos</h3>
              {ALGORITMOS.map((algo) => (
                <button
                  key={algo.id}
                  className={`nav-btn ${algoritmo === algo.id ? 'active' : ''}`}
                  onClick={() => setAlgoritmo(algo.id)}
                >
                  {algo.nombre}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>

      <section className="app-content">
        <header className="app-header">
          <h2>{modo === 'cifrar' ? 'Cifrado' : 'Descifrado'}</h2>
          <p className="subtitle">
            {modo === 'cifrar'
              ? 'Cifra mensajes con algoritmos clásicos'
              : 'Descifra automáticamente detectando el algoritmo'}
          </p>
        </header>

        {modo === 'cifrar' ? (
          <EncryptMode algoritmo={algoritmo} onAlgoritmoChange={setAlgoritmo} />
        ) : (
          <DecryptMode algoritmo={algoritmo} onAlgoritmoChange={setAlgoritmo} />
        )}
      </section>
    </main>
  )
}

export default App

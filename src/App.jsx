import { useMemo, useState } from 'react'
import { algoritmos, obtenerAlgoritmoPorId } from './algorithms'
import './App.css'

function App() {
  const [textoEntrada, establecerTextoEntrada] = useState('')
  const [idAlgoritmoSeleccionado, establecerIdAlgoritmoSeleccionado] = useState(algoritmos[0].id)
  const [desplazamiento, establecerDesplazamiento] = useState(3)
  const [modo, establecerModo] = useState('cifrar')
  const [mostrarFuerzaBruta, establecerMostrarFuerzaBruta] = useState(false)

  const algoritmoSeleccionado = obtenerAlgoritmoPorId(idAlgoritmoSeleccionado)
  const textoLimpio = algoritmoSeleccionado.limpiar
    ? algoritmoSeleccionado.limpiar(textoEntrada)
    : textoEntrada
  const textoInsuficiente = textoLimpio.length > 0 && textoLimpio.length < algoritmoSeleccionado.options.minLength

  const textoResultado = useMemo(() => {
    if (textoInsuficiente) {
      return ''
    }

    if (modo === 'descifrar') {
      return algoritmoSeleccionado.descifrar(textoLimpio, desplazamiento)
    }

    return algoritmoSeleccionado.cifrar(textoLimpio, desplazamiento)
  }, [algoritmoSeleccionado, desplazamiento, modo, textoInsuficiente, textoLimpio])

  const candidatosFuerzaBruta = useMemo(() => {
    if (!mostrarFuerzaBruta || modo !== 'descifrar' || textoInsuficiente || !textoLimpio) {
      return []
    }

    return algoritmoSeleccionado.fuerzaBruta(textoLimpio)
  }, [algoritmoSeleccionado, modo, mostrarFuerzaBruta, textoInsuficiente, textoLimpio])

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="identity">
          <span className="identity-label">Práctica</span>
          <strong>Daniel Sebastián<br />Castro Figueredo</strong>
          <span>Seguridad de la Información</span>
        </div>

        <div className="sidebar-section">
          <span className="section-label">Modo de operación</span>
          <div className="mode-options" role="group" aria-label="Modo de operación">
            <button
              className={modo === 'cifrar' ? 'mode-button active' : 'mode-button'}
              type="button"
              onClick={() => establecerModo('cifrar')}
            >
              <span aria-hidden="true">→</span>
              Cifrar
            </button>
            <button
              className={modo === 'descifrar' ? 'mode-button active' : 'mode-button'}
              type="button"
              onClick={() => establecerModo('descifrar')}
            >
              <span aria-hidden="true">←</span>
              Descifrar
            </button>
          </div>
        </div>

        <div className="sidebar-section sidebar-options">
          <span className="section-label">Opciones</span>
          <label>
            Algoritmo
            <select
              value={idAlgoritmoSeleccionado}
              onChange={(evento) => establecerIdAlgoritmoSeleccionado(evento.target.value)}
            >
              {algoritmos.map((algoritmo) => (
                <option key={algoritmo.id} value={algoritmo.id}>
                  {algoritmo.name}
                </option>
              ))}
            </select>
          </label>

          {algoritmoSeleccionado.options.requiresShift && (
            <label>
              Desplazamiento
              <input
                type="number"
                value={desplazamiento}
                onChange={(evento) => establecerDesplazamiento(evento.target.value)}
              />
            </label>
          )}
        </div>
      </aside>

      <section className="app">
        <h1>Cifrador César</h1>
        <p className="subtitle">Cifrado y descifrado con una interfaz simple y extensible.</p>

        <div className="panes">
          <label>
            {modo === 'cifrar' ? 'Texto original' : 'Texto cifrado'}
            <textarea
              value={textoEntrada}
              onChange={(evento) => establecerTextoEntrada(evento.target.value)}
              placeholder="Escribe al menos 400 caracteres"
            />
            {textoInsuficiente && (
              <small>
                Faltan {algoritmoSeleccionado.options.minLength - textoLimpio.length} caracteres válidos.
              </small>
            )}
          </label>

          <label>
            {modo === 'cifrar' ? 'Texto cifrado' : 'Texto original'}
            <textarea value={textoResultado} readOnly placeholder="Resultado" />
          </label>
        </div>

        {modo === 'descifrar' && (
          <section className="brute-force-section" aria-labelledby="titulo-fuerza-bruta">
            <div className="brute-force-header">
              <div>
                <h2 id="titulo-fuerza-bruta">Análisis por fuerza bruta</h2>
                <p>Prueba las 27 claves disponibles para comparar las posibles frases.</p>
              </div>
              <button
                className="brute-force-button"
                type="button"
                onClick={() => establecerMostrarFuerzaBruta(!mostrarFuerzaBruta)}
              >
                {mostrarFuerzaBruta ? 'Ocultar combinaciones' : 'Probar 27 claves'}
              </button>
            </div>

            {mostrarFuerzaBruta && (
              <div className="candidate-list">
                {candidatosFuerzaBruta.map(({ clave, texto }) => (
                  <article className="candidate" key={clave}>
                    <strong>k = {clave}</strong>
                    <span>{texto}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default App

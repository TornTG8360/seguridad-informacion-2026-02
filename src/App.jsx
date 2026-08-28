import { useMemo, useState } from 'react'
import {
  ALFABETO,
  MINIMO_CARACTERES,
  ataqueAfin,
  ataqueCesar,
  ataqueVigenere,
  detectarAlgoritmo,
  indiceCoincidencia,
  limpiarTexto,
  listaFrecuencias,
} from './algorithms'
import './App.css'

const BLOQUES = [
  { id: 'cesar', titulo: 'César', etiqueta: '01', descripcion: 'Monoalfabético · fuerza bruta', pista: 'IC esperado: ≈ 0.077' },
  { id: 'afin', titulo: 'Afín', etiqueta: '02', descripcion: 'Monoalfabético · ecuación lineal', pista: 'IC esperado: ≈ 0.077' },
  { id: 'vigenere', titulo: 'Vigenère', etiqueta: '03', descripcion: 'Polialfabético · Kasiski', pista: 'IC esperado: ≈ 0.040' },
]

function Badge({ children, tone = '' }) { return <span className={`badge ${tone}`}>{children}</span> }

function FrequencyTable({ texto }) {
  const frecuencias = listaFrecuencias(texto)
  const maximo = frecuencias[0]?.cantidad || 1
  return <div className="frequency-table">{frecuencias.map(({ letra, cantidad, porcentaje }) => <div className="frequency-row" key={letra}><strong>{letra}</strong><div className="frequency-track"><span style={{ width: `${cantidad / maximo * 100}%` }} /></div><span>{cantidad}</span><small>{porcentaje.toFixed(1)}%</small></div>)}</div>
}

function AttackResult({ tipo, texto }) {
  const resultado = useMemo(() => tipo === 'cesar' ? ataqueCesar(texto) : tipo === 'afin' ? ataqueAfin(texto) : ataqueVigenere(texto), [tipo, texto])
  if (tipo === 'cesar') return <div className="attack-content"><p className="muted">Se prueban las {ALFABETO.length} claves posibles. Busca la frase legible:</p><div className="candidate-grid">{resultado.map(({ clave, texto: candidato }) => <div className="candidate" key={clave}><b>k={clave}</b><span>{candidato}</span></div>)}</div></div>
  if (tipo === 'afin') return <div className="attack-content"><p className="muted">La letra más frecuente es <b>{resultado.letraFrecuente}</b>; se supone que corresponde a <b>E</b> y se resuelven las parejas válidas (a, b).</p><div className="candidate-grid">{resultado.candidatos.map(({ a, b, texto: candidato }) => <div className="candidate" key={`${a}-${b}`}><b>a={a}, b={b}</b><span>{candidato}</span></div>)}</div></div>
  return <div className="attack-content"><div className="key-summary"><div><small>Longitud sugerida</small><strong>{resultado.longitudSugerida}</strong></div><div><small>Palabra clave estimada</small><strong>{resultado.clave}</strong></div></div><p className="muted">Kasiski encuentra repeticiones de trigramas: {resultado.repeticiones.length ? resultado.repeticiones.join(', ') : 'no hay repeticiones suficientes; se usa longitud 1'}.</p><div className="decoded-text">{resultado.descifrado}</div></div>
}

function AnalysisBlock({ block, value, onChange }) {
  const texto = limpiarTexto(value)
  const tieneTexto = texto.length > 0
  const completo = texto.length >= MINIMO_CARACTERES
  const ic = indiceCoincidencia(texto)
  const deteccion = detectarAlgoritmo(texto)
  const diagnostico = block.id === 'vigenere' ? 'Polialfabético' : 'Monoalfabético'
  return <article className="cipher-block"><header className="block-header"><div className="block-number">{block.etiqueta}</div><div><h2>{block.titulo}</h2><p>{block.descripcion}</p></div><Badge tone={block.id === 'vigenere' ? 'teal' : ''}>{diagnostico}</Badge></header><label className="cipher-input">Criptograma normalizado<textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Pega aquí al menos 400 caracteres..." spellCheck="false" /></label><div className="counter"><span>{texto.length} / {MINIMO_CARACTERES} caracteres válidos</span>{tieneTexto && !completo && <small>Faltan {MINIMO_CARACTERES - texto.length}</small>}{completo && <Badge tone="ok">Listo para analizar</Badge>}</div>{completo && <><div className="detection"><div><small>Detección automática</small><strong>{deteccion.nombre}</strong></div><div><small>Confianza orientativa</small><strong>{deteccion.confianza}%</strong></div><p>{deteccion.evidencia}</p></div><div className="metrics"><div><small>Índice de coincidencia</small><strong>{ic.toFixed(4)}</strong></div><div><small>Diagnóstico esperado</small><strong>{diagnostico}</strong><span>{block.pista}</span></div><div><small>Muestra</small><strong>{texto.length}</strong><span>letras analizadas</span></div></div><section className="analysis-section"><div className="section-heading"><div><span className="eyebrow">Lectura del criptograma</span><h3>Frecuencia de letras</h3></div><span className="alphabet-note">Alfabeto: {ALFABETO}</span></div><FrequencyTable texto={texto} /></section><section className="analysis-section attack-section"><div className="section-heading"><div><span className="eyebrow">Método de ataque</span><h3>{block.id === 'cesar' ? 'Fuerza bruta' : block.id === 'afin' ? 'Ecuación lineal' : 'Kasiski + frecuencias'}</h3></div><Badge>{block.id === 'cesar' ? `${ALFABETO.length} claves` : block.id === 'afin' ? 'a · x + b' : 'Repeticiones'}</Badge></div><AttackResult tipo={block.id} texto={texto} /></section></>}</article>
}
 
function App() {
  const [activo, setActivo] = useState('cesar')
  const [textos, setTextos] = useState({ cesar: '', afin: '', vigenere: '' })
  const bloqueActivo = BLOQUES.find((block) => block.id === activo)
  return <main className="app-shell"><aside className="sidebar"><div className="brand-mark">CI<span>27</span></div><p className="kicker">Taller 04 / Seguridad</p><h1>Cifrado<br /><em>Clásico</em></h1><p className="intro">Diagnóstico y criptoanálisis de tres criptogramas en español.</p><div className="sidebar-rule" /><nav aria-label="Criptogramas"><span className="nav-label">Criptogramas</span>{BLOQUES.map((block) => <button className={activo === block.id ? 'nav-item active' : 'nav-item'} onClick={() => setActivo(block.id)} key={block.id}><span>{block.etiqueta}</span><b>{block.titulo}</b><small>{block.descripcion}</small></button>)}</nav><footer><span>Estudiante</span><strong>Daniel Sebastián<br />Castro Figueredo</strong><span>Seguridad de la Información</span></footer></aside><section className="app"><div className="topline"><span>Laboratorio de análisis</span><span>ALFABETO ES · 27 SÍMBOLOS</span></div><div className="page-heading"><div><p className="eyebrow">Criptograma {bloqueActivo.etiqueta}</p><h2>{bloqueActivo.titulo}</h2><p>Normaliza, mide y ataca el texto cifrado.</p></div><div className="steps"><span className="current">01 <small>Entrada</small></span><i /><span>02 <small>Diagnóstico</small></span><i /><span>03 <small>Resolución</small></span></div></div><div className="tabs">{BLOQUES.map((block) => <button className={activo === block.id ? 'tab active' : 'tab'} onClick={() => setActivo(block.id)} key={block.id}>{block.titulo}<span>{textos[block.id] ? '●' : '○'}</span></button>)}</div><AnalysisBlock block={bloqueActivo} value={textos[activo]} onChange={(value) => setTextos({ ...textos, [activo]: value })} /></section></main>
}

export default App

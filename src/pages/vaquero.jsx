import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { agregarACola, sincronizarPendientes, contarPendientes, iniciarSyncAutomatico } from '../lib/syncQueue'

const FINCAS = ['La Florida', 'Montecarlo', 'Tesoro', 'Bajogrande', 'Pino']

const CAMPOS = [
  { id:'sector',            nombre:'Sector recorrido',                  pista:'¿Qué área o potrero recorrió hoy?' },
  { id:'reses',             nombre:'Conteo de reses',                   pista:'¿Cuántas reses vio y en qué condición general están?' },
  { id:'agua_pasto',        nombre:'Estado del agua y pasto',           pista:'¿Cómo están los bebederos, ríos o potreros?' },
  { id:'animales_enfermos', nombre:'Animales enfermos o con problemas', pista:'¿Vio algún animal herido, enfermo o con comportamiento extraño?' },
  { id:'instalaciones',     nombre:'Estado de instalaciones',           pista:'Cercas, portones, corrales — ¿algo dañado?' },
  { id:'hallazgos',         nombre:'Hallazgos especiales',              pista:'¿Encontró algo fuera de lo normal?' },
  { id:'observaciones',     nombre:'Observaciones generales',           pista:'Cualquier otra cosa importante que reportar.' }
]

export default function Vaquero() {
  const [pantalla, setPantalla] = useState('inicio')
  const [finca, setFinca] = useState('')
  const [vaquero, setVaquero] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [respuestas, setRespuestas] = useState({})
  const [audios, setAudios] = useState({})
  const [grabando, setGrabando] = useState({})
  const [estadoVoz, setEstadoVoz] = useState({})
  const [online, setOnline] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const navigate = useNavigate()

  const mediaRecs = {}
  const audioChunks = {}
  const speechRecs = {}

useEffect(() => {
  verificarConexion()
  iniciarSyncAutomatico(({ sincronizados }) => {
    if (sincronizados > 0) {
      alert(`✅ ${sincronizados} reporte(s) sincronizados automáticamente con la base de datos.`)
    }
  })
}, [])


  async function verificarConexion() {
    try {
      const r = await fetch('https://oyhotpwtqoeqmxoelxlm.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aG90cHd0cW9lcW14b2VseGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzE4NDcsImV4cCI6MjA5NTA0Nzg0N30.WwkBoTVbUd8yUGYP-ZCNCybuEZYVXeI4YVMAeMkJ180' },
        signal: AbortSignal.timeout(4000)
      })
      setOnline(r.ok || r.status === 400)
    } catch { setOnline(false) }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function iniciarRecorrido() {
    if (!finca) { alert('Selecciona una finca'); return }
    if (!vaquero.trim()) { alert('Ingresa tu nombre'); return }
    setRespuestas({})
    setAudios({})
    setGrabando({})
    setEstadoVoz({})
    setEnviado(false)
    setPantalla('formulario')
  }

  function guardarRespuesta(id, valor) {
    setRespuestas(prev => ({ ...prev, [id]: valor }))
  }

  function progreso() {
    const ok = CAMPOS.filter(c => (respuestas[c.id] || '').trim() || audios[c.id]).length
    return { ok, total: CAMPOS.length, pct: Math.round(ok / CAMPOS.length * 100) }
  }

  function toggleGrabar(id) {
    if (grabando[id]) {
      detenerGrabacion(id)
    } else {
      iniciarGrabacion(id)
    }
  }

  function iniciarGrabacion(id) {
    const tieneSpeech = ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    if (tieneSpeech) iniciarSpeech(id)
    else grabarAudio(id)
  }

  function iniciarSpeech(id) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'es-CR'
    rec.continuous = true
    rec.interimResults = true
    speechRecs[id] = rec
    setGrabando(prev => ({ ...prev, [id]: true }))
    setEstadoVoz(prev => ({ ...prev, [id]: { cls: 'grabando', txt: '🎙 Escuchando...' } }))

    rec.onresult = e => {
      let txt = ''
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript + ' '
      guardarRespuesta(id, txt.trim())
    }

    rec.onerror = e => {
      detenerGrabacion(id)
      if (e.error === 'network' || e.error === 'service-not-allowed') grabarAudio(id)
    }

    rec.onend = () => { if (grabando[id]) { try { rec.start() } catch(e){} } }
    rec.start()
  }

  function grabarAudio(id) {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      setGrabando(prev => ({ ...prev, [id]: true }))
      const mimeType = esIOS && MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm'
      let mr
      try { mr = new MediaRecorder(stream, { mimeType }) }
      catch { mr = new MediaRecorder(stream) }
      mediaRecs[id] = mr
      audioChunks[id] = []
      setEstadoVoz(prev => ({ ...prev, [id]: { cls: 'audio', txt: '⚠ Grabando audio...' } }))
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunks[id].push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunks[id], { type: mimeType })
        setAudios(prev => ({ ...prev, [id]: URL.createObjectURL(blob) }))
        stream.getTracks().forEach(t => t.stop())
        setEstadoVoz(prev => ({ ...prev, [id]: { cls: 'audio', txt: 'Audio guardado localmente' } }))
      }
      mr.start(1000)
    }).catch(() => alert('No se pudo acceder al micrófono'))
  }

  function detenerGrabacion(id) {
    setGrabando(prev => ({ ...prev, [id]: false }))
    if (speechRecs[id]) {
      try { speechRecs[id].stop() } catch(e){}
      delete speechRecs[id]
      setEstadoVoz(prev => ({ ...prev, [id]: { cls: 'ok', txt: '✓ Transcripción guardada' } }))
    }
    if (mediaRecs[id] && mediaRecs[id].state !== 'inactive') {
      mediaRecs[id].stop()
      delete mediaRecs[id]
    }
  }

  async function finalizarRecorrido() {
    const sinNada = CAMPOS.filter(c => !(respuestas[c.id] || '').trim() && !audios[c.id])
    if (sinNada.length > 0) {
      const nombres = sinNada.map(c => c.nombre).join(', ')
      if (!window.confirm(`Faltan ${sinNada.length} campo(s): ${nombres}\n\n¿Guardar de todos modos?`)) return
    }
    setEnviando(true)
    setPantalla('resumen')
    const payload = {
      finca, vaquero, fecha,
      sector:            respuestas.sector            || null,
      reses:             respuestas.reses             || null,
      agua_pasto:        respuestas.agua_pasto        || null,
      animales_enfermos: respuestas.animales_enfermos || null,
      instalaciones:     respuestas.instalaciones     || null,
      hallazgos:         respuestas.hallazgos         || null,
      observaciones:     respuestas.observaciones     || null,
      tiene_audios:      Object.keys(audios).length > 0
    }
    try {
      const { error } = await supabase.from('reportes').insert(payload)
      if (error) throw error
      setEnviando(false)
      setEnviado(true)
    } catch {
      // Sin señal — agregar a cola de sincronización
      agregarACola(payload)
      setEnviando(false)
      setEnviado(false)
    }
  }

  const { ok, total, pct } = progreso()

  // ── PANTALLA INICIO ──
  if (pantalla === 'inicio') return (
    <div style={s.page}>
      <div style={s.cabecera}>
        <div style={s.cabFila}>
          <div>
            <div style={s.etiqueta}>Sistema de campo</div>
            <div style={s.titulo}>Reporte<br/>de Finca</div>
            <div style={s.sub}>Seguimiento diario</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
            <div style={{ ...s.badge, background: online ? 'rgba(255,255,255,0.2)' : 'rgba(186,117,23,0.3)' }}>
              <span style={{ ...s.punto, background: online ? '#9FE1CB' : '#FAC775' }}></span>
              {online ? 'Con señal' : 'Sin señal'}
            </div>
            <button onClick={cerrarSesion} style={s.btnSalir}>Salir</button>
          </div>
        </div>
      </div>

      <div style={s.cuerpo}>
        <div style={s.card}>
          <div style={s.grupoForm}>
            <label style={s.label}>Selecciona la finca</label>
            <div style={s.fincasGrid}>
              {FINCAS.map(f => (
                <button key={f} onClick={() => setFinca(f)}
                  style={{ ...s.fincaBtn, ...(finca === f ? s.fincaSeleccionada : {}) }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={s.grupoForm}>
            <label style={s.label}>Tu nombre</label>
            <input style={s.input} value={vaquero} onChange={e => setVaquero(e.target.value)} placeholder="Ej: Carlos Méndez" />
          </div>
          <div style={{ ...s.grupoForm, marginBottom: 0 }}>
            <label style={s.label}>Fecha del recorrido</label>
            <input type="date" style={s.input} value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
        </div>
        <button style={s.btnPrimario} onClick={iniciarRecorrido}>▶ Iniciar recorrido</button>
      </div>
    </div>
  )

  // ── PANTALLA FORMULARIO ──
  if (pantalla === 'formulario') return (
    <div style={s.page}>
      <div style={{ ...s.cabecera, paddingTop: '2.5rem', paddingBottom: '0.75rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <button onClick={() => { if(window.confirm('¿Salir? Se perderá el progreso.')) setPantalla('inicio') }} style={s.btnVolver}>← Volver</button>
          <div style={{ ...s.badge, background: online ? 'rgba(255,255,255,0.2)' : 'rgba(186,117,23,0.3)' }}>
            <span style={{ ...s.punto, background: online ? '#9FE1CB' : '#FAC775' }}></span>
            {online ? 'Con señal' : 'Sin señal'}
          </div>
        </div>
        <div style={{ ...s.titulo, fontSize:'18px' }}>{vaquero} — {finca}</div>
        <div style={s.sub}>{new Date(fecha+'T12:00:00').toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>

      <div style={s.progresoWrap}>
        <div style={s.progresoInfo}>
          <span>{ok} de {total} completados</span>
          <span>{pct}%</span>
        </div>
        <div style={s.progresoBarra}>
          <div style={{ ...s.progresoFill, width: pct + '%' }}></div>
        </div>
      </div>

      <div style={s.cuerpo}>
        {CAMPOS.map((c, i) => (
          <div key={c.id} style={{ ...s.campoCard, borderColor: (respuestas[c.id]||'').trim() ? 'var(--verde)' : 'var(--borde)' }}>
            <div style={s.campoNum}>Campo {i+1} de {CAMPOS.length}</div>
            <div style={s.campoNombre}>{c.nombre}</div>
            <div style={s.campoPista}>{c.pista}</div>
            <textarea
              style={s.textarea}
              rows={2}
              placeholder="Toca el micrófono o escribe aquí..."
              value={respuestas[c.id] || ''}
              onChange={e => guardarRespuesta(c.id, e.target.value)}
            />
            <div style={s.filaVoz}>
              <button
                style={{ ...s.btnMic, ...(grabando[c.id] ? s.btnMicGrabando : {}) }}
                onClick={() => toggleGrabar(c.id)}>
                <span style={{ ...s.micDot, background: grabando[c.id] ? 'var(--rojo)' : 'var(--verde)' }}></span>
                {grabando[c.id] ? 'Detener' : 'Grabar'}
              </button>
              <span style={{ ...s.vozEstado, color: estadoVoz[c.id]?.cls === 'ok' ? 'var(--verde)' : estadoVoz[c.id]?.cls === 'grabando' ? 'var(--rojo)' : estadoVoz[c.id]?.cls === 'audio' ? 'var(--amber)' : 'var(--texto-sec)' }}>
                {estadoVoz[c.id]?.txt || 'Toca para grabar'}
              </span>
            </div>
            {audios[c.id] && (
              <div style={s.audioAviso}>
                ⚠ Audio guardado localmente — transcribir al recuperar señal
              </div>
            )}
          </div>
        ))}
        <button style={s.btnPrimario} onClick={finalizarRecorrido}>✓ Finalizar recorrido</button>
      </div>
    </div>
  )

  // ── PANTALLA RESUMEN ──
  if (pantalla === 'resumen') return (
    <div style={s.page}>
      <div style={s.cabecera}>
        <div style={s.etiqueta}>Recorrido finalizado</div>
        <div style={s.titulo}>Reporte<br/>completado</div>
        <div style={s.sub}>{vaquero} — {finca}</div>
      </div>
      <div style={s.cuerpo}>
        <div style={{ ...s.card, textAlign:'center', padding:'1.5rem' }}>
          <div style={s.checkCirculo}>✓</div>
          <div style={{ fontSize:'14px', color:'var(--texto-sec)', lineHeight:1.5 }}>
            {enviando && '⏳ Enviando a la base de datos...'}
            {!enviando && enviado && '✅ Reporte enviado correctamente.'}
            {!enviando && !enviado && '⚠️ Sin conexión — reporte guardado localmente.'}
          </div>
        </div>
        <div style={s.card}>
          {CAMPOS.map(c => (
            <div key={c.id} style={s.resumenItem}>
              <div style={s.resumenCampo}>{c.nombre}</div>
              <div style={s.resumenValor}>
                {(respuestas[c.id]||'').trim() || (audios[c.id] ? '🎙 Audio guardado' : <span style={{color:'#bbb',fontStyle:'italic'}}>Sin respuesta</span>)}
              </div>
            </div>
          ))}
        </div>
        <button style={s.btnPrimario} onClick={() => { setFinca(''); setPantalla('inicio') }}>Nuevo recorrido</button>
      </div>
    </div>
  )
}

const s = {
  page: { maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'var(--gris)' },
  cabecera: { background:'var(--verde)', padding:'3rem 1.25rem 1.25rem', position:'relative', overflow:'hidden' },
  cabFila: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  etiqueta: { fontSize:'11px', fontWeight:'500', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.65)', marginBottom:'4px' },
  titulo: { fontSize:'26px', fontWeight:'600', color:'white', lineHeight:1.2 },
  sub: { fontSize:'13px', color:'rgba(255,255,255,0.7)', marginTop:'4px' },
  badge: { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', color:'white' },
  punto: { width:'7px', height:'7px', borderRadius:'50%', display:'inline-block' },
  btnSalir: { background:'rgba(255,255,255,0.15)', border:'none', color:'white', fontSize:'12px', padding:'5px 12px', borderRadius:'20px', cursor:'pointer' },
  btnVolver: { background:'none', border:'none', color:'rgba(255,255,255,0.85)', fontSize:'13px', cursor:'pointer' },
  cuerpo: { padding:'1.25rem' },
  card: { background:'var(--blanco)', borderRadius:'var(--radio)', border:'0.5px solid var(--borde)', padding:'1.1rem 1.25rem', marginBottom:'1rem' },
  grupoForm: { marginBottom:'14px' },
  label: { display:'block', fontSize:'13px', fontWeight:'500', color:'var(--texto-sec)', marginBottom:'6px' },
  input: { width:'100%', padding:'12px 14px', border:'0.5px solid var(--borde-med)', borderRadius:'var(--radio-sm)', fontSize:'15px', background:'var(--gris)', color:'var(--texto)' },
  fincasGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  fincaBtn: { padding:'14px 10px', borderRadius:'var(--radio-sm)', border:'1.5px solid var(--borde-med)', background:'var(--gris)', fontSize:'14px', fontWeight:'500', cursor:'pointer', textAlign:'center' },
  fincaSeleccionada: { background:'var(--verde-light)', borderColor:'var(--verde)', color:'var(--verde-dark)' },
  btnPrimario: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', padding:'15px', background:'var(--verde)', color:'white', border:'none', borderRadius:'var(--radio)', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginBottom:'10px' },
  progresoWrap: { padding:'1rem 1.25rem 0', background:'var(--verde-mid)' },
  progresoInfo: { display:'flex', justifyContent:'space-between', fontSize:'12px', color:'rgba(255,255,255,0.75)', marginBottom:'8px' },
  progresoBarra: { height:'3px', background:'rgba(255,255,255,0.2)', borderRadius:'2px', overflow:'hidden' },
  progresoFill: { height:'100%', background:'white', borderRadius:'2px', transition:'width 0.4s' },
  campoCard: { background:'var(--blanco)', borderRadius:'var(--radio)', border:'0.5px solid var(--borde)', padding:'1.1rem 1.25rem', marginBottom:'1rem', transition:'border-color 0.2s' },
  campoNum: { fontSize:'11px', fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--texto-sec)', marginBottom:'3px' },
  campoNombre: { fontSize:'16px', fontWeight:'600', color:'var(--texto)', marginBottom:'3px' },
  campoPista: { fontSize:'13px', color:'var(--texto-sec)', marginBottom:'12px', lineHeight:1.4 },
  textarea: { width:'100%', minHeight:'72px', border:'0.5px solid var(--borde-med)', borderRadius:'var(--radio-sm)', padding:'10px 12px', fontSize:'14px', color:'var(--texto)', background:'var(--gris)', resize:'vertical', lineHeight:1.5 },
  filaVoz: { display:'flex', alignItems:'center', gap:'10px', marginTop:'10px' },
  btnMic: { display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', borderRadius:'var(--radio-sm)', fontSize:'13px', fontWeight:'500', border:'0.5px solid var(--borde-med)', background:'var(--gris)', color:'var(--texto)', cursor:'pointer', whiteSpace:'nowrap' },
  btnMicGrabando: { background:'var(--rojo-light)', borderColor:'var(--rojo)', color:'var(--rojo)' },
  micDot: { width:'8px', height:'8px', borderRadius:'50%' },
  vozEstado: { fontSize:'12px', flex:1, lineHeight:1.3 },
  audioAviso: { display:'flex', alignItems:'center', gap:'8px', marginTop:'8px', padding:'8px 12px', background:'var(--amber-light)', borderRadius:'var(--radio-sm)', fontSize:'12px', color:'var(--amber)' },
  checkCirculo: { width:'56px', height:'56px', borderRadius:'50%', background:'var(--verde-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'24px', color:'var(--verde)', fontWeight:'600' },
  resumenItem: { padding:'10px 0', borderBottom:'0.5px solid var(--borde)' },
  resumenCampo: { fontSize:'12px', color:'var(--texto-sec)', marginBottom:'3px' },
  resumenValor: { fontSize:'14px', color:'var(--texto)', lineHeight:1.4 }
}
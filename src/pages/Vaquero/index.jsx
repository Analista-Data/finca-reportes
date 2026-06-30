import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { agregarACola, contarPendientes, iniciarSyncAutomatico } from '../../lib/syncQueue'
import { PageLayout, PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary } from '../../components/ui/Button'
import { BadgeSeñal, BadgePendientes } from '../../components/ui/Badge'
import { Input, FincaSelector } from '../../components/ui/Input'
import { FINCAS } from '../../styles/theme'
import * as sh from '../../styles/shared'

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
  const { perfil } = useAuth()
  const [pantalla, setPantalla] = useState('inicio')
  const [finca, setFinca] = useState('')
  const [vaquero, setVaquero] = useState(perfil?.nombre || '')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [respuestas, setRespuestas] = useState({})
  const [audios, setAudios] = useState({})
  const [grabando, setGrabando] = useState({})
  const [estadoVoz, setEstadoVoz] = useState({})
  const [online, setOnline] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [pendientes, setPendientes] = useState(0)

  const mediaRecs = {}
  const audioChunks = {}
  const speechRecs = {}

  useEffect(() => {
    verificarConexion()
    setPendientes(contarPendientes())
    iniciarSyncAutomatico(({ sincronizados }) => {
      if (sincronizados > 0) {
        setPendientes(contarPendientes())
        alert(`✅ ${sincronizados} reporte(s) sincronizados automáticamente.`)
      }
    })
  }, [])

  async function verificarConexion() {
    if (!navigator.onLine) { setOnline(false); return }
    try {
      await fetch('https://www.google.com/favicon.ico', { method:'HEAD', mode:'no-cors', signal: AbortSignal.timeout(4000) })
      setOnline(true)
    } catch { setOnline(false) }
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
    window.scrollTo(0, 0)
  }

  function guardarRespuesta(id, valor) {
    setRespuestas(prev => ({ ...prev, [id]: valor }))
  }

  function progreso() {
    const ok = CAMPOS.filter(c => (respuestas[c.id] || '').trim() || audios[c.id]).length
    return { ok, total: CAMPOS.length, pct: Math.round(ok / CAMPOS.length * 100) }
  }

  function toggleGrabar(id) {
    grabando[id] ? detenerGrabacion(id) : iniciarGrabacion(id)
  }

  function iniciarGrabacion(id) {
    const tieneSpeech = ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    if (tieneSpeech) iniciarSpeech(id)
    else grabarAudio(id)
  }

  function iniciarSpeech(id) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'es-CR'; rec.continuous = true; rec.interimResults = true
    speechRecs[id] = rec
    setGrabando(prev => ({ ...prev, [id]: true }))
    setEstadoVoz(prev => ({ ...prev, [id]: { cls:'grabando', txt:'🎙 Escuchando...' } }))
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
      mediaRecs[id] = mr; audioChunks[id] = []
      setEstadoVoz(prev => ({ ...prev, [id]: { cls:'audio', txt:'⚠ Grabando audio...' } }))
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunks[id].push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunks[id], { type: mimeType })
        setAudios(prev => ({ ...prev, [id]: URL.createObjectURL(blob) }))
        stream.getTracks().forEach(t => t.stop())
        setEstadoVoz(prev => ({ ...prev, [id]: { cls:'audio', txt:'Audio guardado localmente' } }))
      }
      mr.start(1000)
    }).catch(() => alert('No se pudo acceder al micrófono'))
  }

  function detenerGrabacion(id) {
    setGrabando(prev => ({ ...prev, [id]: false }))
    if (speechRecs[id]) {
      try { speechRecs[id].stop() } catch(e){}
      delete speechRecs[id]
      setEstadoVoz(prev => ({ ...prev, [id]: { cls:'ok', txt:'✓ Transcripción guardada' } }))
    }
    if (mediaRecs[id] && mediaRecs[id].state !== 'inactive') {
      mediaRecs[id].stop(); delete mediaRecs[id]
    }
  }

  async function generarAlertasAutomaticas(reporte) {
    const alertas = []
    const palabrasCriticas = ['enferm','herido','muerto','muerta','cojo','coja','sangr','emerg','urgente','grave','mal estado']
    const palabrasInstalacion = ['roto','dañado','dañada','caído','caida','requiere','reparar','urgente']
    const palabrasAgua = ['seco','seca','vacio','vacío','sin agua','poco']

    if (reporte.animales_enfermos) {
      const txt = reporte.animales_enfermos.toLowerCase()
      if (palabrasCriticas.some(p => txt.includes(p)) && !['ninguno','sin novedad','todo bien'].includes(txt)) {
        alertas.push({ finca: reporte.finca, tipo:'Animal enfermo', mensaje:`${reporte.vaquero} reporta en ${reporte.finca}: "${reporte.animales_enfermos}"`, prioridad:'alta', origen: reporte.vaquero, leida: false })
      }
    }
    if (reporte.instalaciones) {
      const txt = reporte.instalaciones.toLowerCase()
      if (palabrasInstalacion.some(p => txt.includes(p)) && !['todo bien','sin novedad'].includes(txt)) {
        alertas.push({ finca: reporte.finca, tipo:'Instalación dañada', mensaje:`${reporte.vaquero} reporta en ${reporte.finca}: "${reporte.instalaciones}"`, prioridad:'media', origen: reporte.vaquero, leida: false })
      }
    }
    if (reporte.agua_pasto) {
      const txt = reporte.agua_pasto.toLowerCase()
      if (palabrasAgua.some(p => txt.includes(p))) {
        alertas.push({ finca: reporte.finca, tipo:'Agua o pasto escaso', mensaje:`${reporte.vaquero} reporta en ${reporte.finca}: "${reporte.agua_pasto}"`, prioridad:'media', origen: reporte.vaquero, leida: false })
      }
    }
    if (reporte.hallazgos) {
      const txt = reporte.hallazgos.toLowerCase()
      if (!['ninguno','sin novedad','todo bien','nada'].includes(txt) && txt.length > 10) {
        alertas.push({ finca: reporte.finca, tipo:'Hallazgo especial', mensaje:`${reporte.vaquero} reporta en ${reporte.finca}: "${reporte.hallazgos}"`, prioridad:'media', origen: reporte.vaquero, leida: false })
      }
    }
    if (alertas.length > 0) await supabase.from('alertas').insert(alertas)
  }

  async function finalizarRecorrido() {
    const sinNada = CAMPOS.filter(c => !(respuestas[c.id] || '').trim() && !audios[c.id])
    if (sinNada.length > 0) {
      if (!window.confirm(`Faltan ${sinNada.length} campo(s) sin completar.\n\n¿Guardar de todos modos?`)) return
    }
    setEnviando(true)
    setPantalla('resumen')
    window.scrollTo(0, 0)
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
      setEnviado(true)
      await generarAlertasAutomaticas(payload)
    } catch {
      agregarACola(payload)
      setPendientes(contarPendientes())
    }
    setEnviando(false)
  }

  const { ok, total, pct } = progreso()

  // ── PANTALLA INICIO ──
  if (pantalla === 'inicio') return (
    <PageLayout>
      <div style={{ background:'var(--verde)', padding:'3rem 1.25rem 1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={sh.cabEtiqueta}>Sistema de campo</div>
            <div style={sh.cabTitulo}>Reporte<br/>de Finca</div>
            <div style={sh.cabSub}>Seguimiento diario</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
            <BadgeSeñal online={online} />
            <BadgePendientes count={pendientes} />
          </div>
        </div>
      </div>
      <PageBody>
        <Card>
          <FincaSelector value={finca} onChange={setFinca} />
          <div style={{ marginTop:'14px' }}>
            <Input label="Tu nombre" value={vaquero}
              onChange={e => setVaquero(e.target.value)} placeholder="Ej: Carlos Méndez" />
          </div>
          <Input label="Fecha del recorrido" type="date" value={fecha}
            onChange={e => setFecha(e.target.value)} />
        </Card>
        <ButtonPrimary onClick={iniciarRecorrido}>▶ Iniciar recorrido</ButtonPrimary>
      </PageBody>
    </PageLayout>
  )

  // ── PANTALLA FORMULARIO ──
  if (pantalla === 'formulario') return (
    <PageLayout>
      <div style={{ background:'var(--verde)', padding:'2.5rem 1.25rem 0.75rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <button onClick={() => { if(window.confirm('¿Salir? Se perderá el progreso.')) setPantalla('inicio') }}
            style={sh.btnVolver}>← Volver</button>
          <BadgeSeñal online={online} />
        </div>
        <div style={{ ...sh.cabTitulo, fontSize:'17px' }}>{vaquero}</div>
        <div style={sh.cabSub}>{finca} — {new Date(fecha+'T12:00:00').toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>

      <div style={{ padding:'10px 1.25rem 0', background:'var(--verde-mid)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
          <span>{ok} de {total} completados</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height:'3px', background:'rgba(255,255,255,0.2)', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'white', borderRadius:'2px', transition:'width 0.4s' }}></div>
        </div>
      </div>

      <PageBody>
        {CAMPOS.map((c, i) => {
          const completo = (respuestas[c.id] || '').trim()
          const estaGrabando = grabando[c.id]
          const voz = estadoVoz[c.id]
          return (
            <div key={c.id} style={{ background:'white', borderRadius:'14px', border:`0.5px solid ${completo ? 'var(--verde)' : 'var(--gris-borde)'}`, padding:'1.1rem 1.25rem', marginBottom:'1rem', transition:'border-color 0.2s' }}>
              <div style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--texto-sec)', marginBottom:'2px' }}>Campo {i+1} de {total}</div>
              <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'3px' }}>{c.nombre}</div>
              <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginBottom:'10px', lineHeight:1.4 }}>{c.pista}</div>
              <textarea
                style={{ width:'100%', minHeight:'68px', border:'0.5px solid var(--gris-borde-med)', borderRadius:'8px', padding:'9px 11px', fontSize:'13px', color:'var(--texto)', background:'var(--gris)', resize:'vertical', lineHeight:1.5 }}
                rows={2}
                placeholder="Toca el micrófono o escribe aquí..."
                value={respuestas[c.id] || ''}
                onChange={e => guardarRespuesta(c.id, e.target.value)}
              />
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'8px' }}>
                <button
                  style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 13px', borderRadius:'8px', border:`0.5px solid ${estaGrabando ? 'var(--rojo)' : 'var(--gris-borde-med)'}`, background: estaGrabando ? 'var(--rojo-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', color: estaGrabando ? 'var(--rojo)' : 'var(--texto)', cursor:'pointer', whiteSpace:'nowrap' }}
                  onClick={() => toggleGrabar(c.id)}>
                  <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: estaGrabando ? 'var(--rojo)' : 'var(--verde)', display:'inline-block' }}></span>
                  {estaGrabando ? 'Detener' : 'Grabar'}
                </button>
                <span style={{ fontSize:'12px', flex:1, color: voz?.cls === 'ok' ? 'var(--verde)' : voz?.cls === 'grabando' ? 'var(--rojo)' : voz?.cls === 'audio' ? 'var(--amber)' : 'var(--texto-sec)' }}>
                  {voz?.txt || 'Toca para grabar'}
                </span>
              </div>
              {audios[c.id] && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'8px', padding:'8px 10px', background:'var(--amber-light)', borderRadius:'8px', fontSize:'11px', color:'var(--amber-dark)' }}>
                  ⚠ Audio guardado — transcribir al recuperar señal
                </div>
              )}
            </div>
          )
        })}
        <ButtonPrimary onClick={finalizarRecorrido}>✓ Finalizar recorrido</ButtonPrimary>
      </PageBody>
    </PageLayout>
  )

  // ── PANTALLA RESUMEN ──
  if (pantalla === 'resumen') return (
    <PageLayout>
      <div style={{ background:'var(--verde)', padding:'3rem 1.25rem 1.25rem' }}>
        <div style={sh.cabEtiqueta}>Recorrido finalizado</div>
        <div style={sh.cabTitulo}>Reporte<br/>completado</div>
        <div style={sh.cabSub}>{vaquero} — {finca}</div>
      </div>
      <PageBody>
        <Card style={{ textAlign:'center', padding:'1.75rem 1.25rem' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'var(--verde-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'22px', color:'var(--verde)', fontWeight:'500' }}>✓</div>
          <div style={{ fontSize:'14px', color:'var(--texto-sec)', lineHeight:1.6 }}>
            {enviando && '⏳ Enviando a la base de datos...'}
            {!enviando && enviado && '✅ Reporte enviado correctamente a la base de datos.'}
            {!enviando && !enviado && '⚠️ Sin conexión — reporte guardado localmente. Se enviará automáticamente cuando haya señal.'}
          </div>
        </Card>
        <Card>
          {CAMPOS.map((c, i) => (
            <div key={c.id} style={{ padding:'10px 0', borderBottom: i < CAMPOS.length-1 ? '0.5px solid var(--gris-borde)' : 'none' }}>
              <div style={{ fontSize:'11px', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--texto-sec)', marginBottom:'3px' }}>{c.nombre}</div>
              <div style={{ fontSize:'14px', color:'var(--texto)', lineHeight:1.4 }}>
                {(respuestas[c.id]||'').trim() || (audios[c.id] ? <span style={{ background:'var(--amber-light)', color:'var(--amber-dark)', fontSize:'12px', padding:'2px 8px', borderRadius:'20px' }}>🎙 Audio guardado</span> : <span style={{ color:'#ccc', fontStyle:'italic' }}>Sin respuesta</span>)}
              </div>
            </div>
          ))}
        </Card>
        <ButtonPrimary onClick={() => { setFinca(''); setPantalla('inicio'); window.scrollTo(0,0) }}>
          Nuevo recorrido
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setPantalla('inicio')}>Volver al inicio</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
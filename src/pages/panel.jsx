import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Panel() {
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [reporteAbierto, setReporteAbierto] = useState(null)
  const navigate = useNavigate()

  const FINCAS = ['', 'La Florida', 'Montecarlo', 'Tesoro', 'Bajogrande', 'Pino']

  const CAMPOS = [
    { id:'sector',            nombre:'Sector recorrido' },
    { id:'reses',             nombre:'Conteo de reses' },
    { id:'agua_pasto',        nombre:'Estado del agua y pasto' },
    { id:'animales_enfermos', nombre:'Animales enfermos' },
    { id:'instalaciones',     nombre:'Estado de instalaciones' },
    { id:'hallazgos',         nombre:'Hallazgos especiales' },
    { id:'observaciones',     nombre:'Observaciones generales' }
  ]

  useEffect(() => {
   // verificarSesion()
    cargarReportes()
  }, [])

 // async function verificarSesion() {
 //   const { data } = await supabase.auth.getSession()
 //   if (!data.session) navigate('/login')
 // }

  async function cargarReportes() {
    setCargando(true)
    let query = supabase
      .from('reportes')
      .select('*')
      .order('creado_en', { ascending: false })

    if (filtroFinca) query = query.eq('finca', filtroFinca)
    if (filtroFecha) query = query.eq('fecha', filtroFecha)

    const { data } = await query
    setReportes(data || [])
    setCargando(false)
  }

  useEffect(() => { cargarReportes() }, [filtroFinca, filtroFecha])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function exportarCSV() {
    const cols = ['Fecha', 'Finca', 'Vaquero', ...CAMPOS.map(c => c.nombre)]
    const filas = reportes.map(r => [
      r.fecha, r.finca, r.vaquero,
      ...CAMPOS.map(c => '"' + (r[c.id] || '').replace(/"/g, '""') + '"')
    ])
    const csv = '\uFEFF' + [cols.join(','), ...filas.map(f => f.join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = 'reportes_' + new Date().toISOString().split('T')[0] + '.csv'
    a.click()
  }

  function formatFecha(f) {
    if (!f) return ''
    return new Date(f + 'T12:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={s.page}>
      {/* CABECERA */}
      <div style={s.cabecera}>
        <div style={s.cabFila}>
          <div>
            <div style={s.etiqueta}>Panel de control</div>
            <div style={s.titulo}>Reportes<br/>de Finca</div>
            <div style={s.sub}>{reportes.length} reportes encontrados</div>
          </div>
          <button onClick={cerrarSesion} style={s.btnSalir}>Salir</button>
        </div>
      </div>

      <div style={s.cuerpo}>
        {/* FILTROS */}
        <div style={s.card}>
          <div style={s.filtrosGrid}>
            <div>
              <label style={s.label}>Finca</label>
              <select style={s.select} value={filtroFinca} onChange={e => setFiltroFinca(e.target.value)}>
                {FINCAS.map(f => <option key={f} value={f}>{f || 'Todas las fincas'}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Fecha</label>
              <input type="date" style={s.select} value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
            </div>
          </div>
          {(filtroFinca || filtroFecha) && (
            <button style={s.btnLimpiar} onClick={() => { setFiltroFinca(''); setFiltroFecha('') }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* BOTÓN EXPORTAR */}
        <button style={s.btnPrimario} onClick={exportarCSV}>
          ↓ Exportar todo a Excel (.csv)
        </button>

        {/* LISTA DE REPORTES */}
        {cargando ? (
          <div style={s.cargando}>Cargando reportes...</div>
        ) : reportes.length === 0 ? (
          <div style={s.vacio}>No hay reportes con esos filtros</div>
        ) : (
          reportes.map(r => (
            <div key={r.id} style={s.reporteCard} onClick={() => setReporteAbierto(reporteAbierto?.id === r.id ? null : r)}>
              <div style={s.reporteFila}>
                <div>
                  <div style={s.reporteNombre}>{r.vaquero}</div>
                  <div style={s.reporteFinca}>{r.finca}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={s.reporteFecha}>{formatFecha(r.fecha)}</div>
                  {r.tiene_audios && <div style={s.badgeAudio}>🎙 Audio</div>}
                </div>
              </div>

              {/* DETALLE EXPANDIBLE */}
              {reporteAbierto?.id === r.id && (
                <div style={s.detalle}>
                  <div style={s.detalleDivisor}></div>
                  {CAMPOS.map(c => (
                    <div key={c.id} style={s.detalleItem}>
                      <div style={s.detalleCampo}>{c.nombre}</div>
                      <div style={s.detalleValor}>
                        {r[c.id] || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Sin respuesta</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const s = {
  page: { maxWidth: '900px', margin: '0 auto', minHeight: '100vh', background: 'var(--gris)' },
  cabecera: { background: 'var(--verde)', padding: '3rem 1.5rem 1.25rem' },
  cabFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  etiqueta: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: '4px' },
  titulo: { fontSize: '26px', fontWeight: '600', color: 'white', lineHeight: 1.2 },
  sub: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' },
  btnSalir: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '13px', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' },
  cuerpo: { padding: '1.25rem' },
  card: { background: 'var(--blanco)', borderRadius: 'var(--radio)', border: '0.5px solid var(--borde)', padding: '1.1rem 1.25rem', marginBottom: '1rem' },
  filtrosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--texto-sec)', marginBottom: '6px' },
  select: { width: '100%', padding: '10px 12px', border: '0.5px solid var(--borde-med)', borderRadius: 'var(--radio-sm)', fontSize: '14px', background: 'var(--gris)', color: 'var(--texto)' },
  btnLimpiar: { marginTop: '10px', background: 'none', border: 'none', color: 'var(--verde)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  btnPrimario: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', background: 'var(--verde)', color: 'white', border: 'none', borderRadius: 'var(--radio)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem' },
  cargando: { textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)', fontSize: '14px' },
  vacio: { textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)', fontSize: '14px' },
  reporteCard: { background: 'var(--blanco)', borderRadius: 'var(--radio)', border: '0.5px solid var(--borde)', padding: '1rem 1.25rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'border-color 0.2s' },
  reporteFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  reporteNombre: { fontSize: '15px', fontWeight: '600', color: 'var(--texto)', marginBottom: '3px' },
  reporteFinca: { fontSize: '13px', color: 'var(--texto-sec)' },
  reporteFecha: { fontSize: '13px', color: 'var(--texto-sec)', marginBottom: '4px' },
  badgeAudio: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'var(--amber-light)', color: 'var(--amber)', display: 'inline-block' },
  detalle: { marginTop: '12px' },
  detalleDivisor: { height: '0.5px', background: 'var(--borde)', marginBottom: '12px' },
  detalleItem: { padding: '8px 0', borderBottom: '0.5px solid var(--borde)' },
  detalleCampo: { fontSize: '11px', color: 'var(--texto-sec)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detalleValor: { fontSize: '14px', color: 'var(--texto)', lineHeight: 1.4 }
}
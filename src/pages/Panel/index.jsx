import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReportes } from '../../hooks/useReportes'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { FINCAS } from '../../styles/theme'
import * as sh from '../../styles/shared'

const CAMPOS = [
  { id:'sector',            nombre:'Sector recorrido' },
  { id:'reses',             nombre:'Conteo de reses' },
  { id:'agua_pasto',        nombre:'Estado del agua y pasto' },
  { id:'animales_enfermos', nombre:'Animales enfermos' },
  { id:'instalaciones',     nombre:'Estado de instalaciones' },
  { id:'hallazgos',         nombre:'Hallazgos especiales' },
  { id:'observaciones',     nombre:'Observaciones generales' }
]

export default function Panel() {
  const { perfil, logout } = useAuth()
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [tabActiva, setTabActiva] = useState('')
  const [abierto, setAbierto] = useState(null)

  const { reportes, cargando, stats } = useReportes(tabActiva || filtroFinca, filtroFecha)

  function exportarCSV() {
    const cols = ['Fecha','Finca','Vaquero',...CAMPOS.map(c => c.nombre)]
    const filas = reportes.map(r => [
      r.fecha, r.finca, r.vaquero,
      ...CAMPOS.map(c => '"'+(r[c.id]||'').replace(/"/g,'""')+'"')
    ])
    const csv = '\uFEFF' + [cols.join(','), ...filas.map(f=>f.join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}))
    a.download = 'reportes_' + new Date().toISOString().split('T')[0] + '.csv'
    a.click()
  }

  function formatFecha(f) {
    if (!f) return ''
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now()-86400000).toISOString().split('T')[0]
    if (f === hoy) return 'Hoy'
    if (f === ayer) return 'Ayer'
    return new Date(f+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'})
  }

  function formatHora(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString('es-CR',{hour:'2-digit',minute:'2-digit'})
  }

  return (
    <PageLayout wide>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Reportes\nde Campo'}
        derecha={
          <button onClick={logout} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', fontSize:'13px', fontWeight:'500', padding:'8px 16px', borderRadius:'20px', cursor:'pointer' }}>
            Salir
          </button>
        }
      />
      <div style={{ background:'var(--verde)', padding:'0 1.5rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'reportes' },
          { valor: stats.hoy, label:'hoy' },
          { valor: stats.conAudio, label:'con audio' }
        ]} />
      </div>

      <div style={{ background:'white', borderBottom:'0.5px solid var(--gris-borde)', overflowX:'auto' }}>
        <div style={{ display:'flex', padding:'0 1.25rem', gap:'4px', minWidth:'max-content' }}>
          {['', ...FINCAS].map(f => (
            <button key={f} onClick={() => setTabActiva(f)}
              style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', border:'none', background:'transparent', color: tabActiva === f ? 'var(--verde)' : 'var(--texto-sec)', borderBottom: tabActiva === f ? '2px solid var(--verde)' : '2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>
              {f || 'Todas'}
            </button>
          ))}
        </div>
      </div>

      <PageBody>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem' }}>
          <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
            style={{ padding:'9px 12px', border:'0.5px solid var(--gris-borde-med)', borderRadius:'8px', fontSize:'13px', background:'white', color:'var(--texto)' }} />
          {filtroFecha && (
            <button onClick={() => setFiltroFecha('')}
              style={{ background:'none', border:'none', color:'var(--texto-sec)', fontSize:'13px', cursor:'pointer' }}>
              ✕ Limpiar
            </button>
          )}
        </div>

        <ButtonPrimary onClick={exportarCSV} style={{ marginBottom:'1rem' }}>
          ↓ Exportar a Excel (.csv)
        </ButtonPrimary>

        {cargando ? (
          <div style={sh.estado}>Cargando reportes...</div>
        ) : reportes.length === 0 ? (
          <div style={sh.estado}>No hay reportes con esos filtros</div>
        ) : (
          reportes.map(r => (
            <Card key={r.id} style={{ cursor:'pointer' }}
              onClick={() => setAbierto(abierto === r.id ? null : r.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'3px' }}>{r.vaquero}</div>
                  <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{r.finca}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'13px', fontWeight:'500', color:'var(--texto)', marginBottom:'2px' }}>{formatFecha(r.fecha)}</div>
                  <div style={{ fontSize:'11px', color:'var(--texto-sec)' }}>{formatHora(r.creado_en)}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                <Badge tipo="verde">Completado</Badge>
                {r.tiene_audios && <Badge tipo="amber">🎙 Audio</Badge>}
              </div>
              {abierto === r.id && (
                <div style={{ marginTop:'12px' }}>
                  <div style={{ height:'0.5px', background:'var(--gris-borde)', marginBottom:'10px' }}></div>
                  {CAMPOS.map(c => (
                    <div key={c.id} style={{ padding:'7px 0', borderBottom:'0.5px solid var(--gris-borde)' }}>
                      <div style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--texto-sec)', marginBottom:'3px' }}>{c.nombre}</div>
                      <div style={{ fontSize:'13px', color:'var(--texto)', lineHeight:1.4 }}>
                        {r[c.id] || <span style={{ color:'#ccc', fontStyle:'italic' }}>Sin respuesta</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </PageBody>
    </PageLayout>
  )
}
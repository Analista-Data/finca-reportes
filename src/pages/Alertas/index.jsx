import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAlertas } from '../../hooks/useAlertas'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Textarea, FincaSelector } from '../../components/ui/Input'
import { FINCAS, PRIORIDADES, prioridadConfig } from '../../styles/theme'
import * as sh from '../../styles/shared'

export default function Alertas() {
  const { perfil } = useAuth()
  const [vista, setVista] = useState('lista')
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroLeida, setFiltroLeida] = useState('false')
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    finca:'', tipo:'', mensaje:'', prioridad:'media', origen:''
  })

  const { alertas, cargando, stats, marcarLeida, marcarTodasLeidas, crear } = useAlertas(filtroFinca, filtroLeida)

  async function handleGuardar() {
    if (!form.mensaje.trim()) { alert('Ingresa un mensaje'); return }
    if (!form.tipo.trim()) { alert('Ingresa el tipo de alerta'); return }
    setGuardando(true)
    await crear(form, perfil?.nombre)
    setGuardando(false)
    setVista('lista')
  }

  function formatTiempo(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    const diff = Math.floor((new Date() - d) / 1000)
    if (diff < 60) return 'Hace un momento'
    if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff/3600)}h`
    return d.toLocaleDateString('es-CR', { day:'numeric', month:'short' })
  }

  if (vista === 'lista') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Centro de\nAlertas'}
        derecha={
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', alignItems:'flex-end' }}>
            {perfil?.rol === 'admin' && <ButtonNuevo onClick={() => setVista('form')}>+ Nueva</ButtonNuevo>}
            {stats.noleidas > 0 && (
              <button onClick={marcarTodasLeidas} style={{ background:'rgba(255,255,255,0.12)', border:'none', color:'rgba(255,255,255,0.8)', fontSize:'11px', padding:'5px 10px', borderRadius:'20px', cursor:'pointer' }}>
                ✓ Marcar todas leídas
              </button>
            )}
          </div>
        }
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'total' },
          { valor: stats.noleidas, label:'no leídas', alerta: stats.noleidas > 0 },
          { valor: stats.criticas, label:'críticas', alerta: stats.criticas > 0 }
        ]} />
      </div>
      <PageBody>
        <div style={sh.filtrosFila}>
          <select style={sh.select} value={filtroFinca} onChange={e => setFiltroFinca(e.target.value)}>
            <option value="">Todas las fincas</option>
            {FINCAS.map(f => <option key={f}>{f}</option>)}
          </select>
          <select style={sh.select} value={filtroLeida} onChange={e => setFiltroLeida(e.target.value)}>
            <option value="false">No leídas</option>
            <option value="true">Leídas</option>
            <option value="">Todas</option>
          </select>
        </div>

        {cargando ? (
          <div style={sh.estado}>Cargando alertas...</div>
        ) : alertas.length === 0 ? (
          <div style={sh.estado}>
            <div style={{ fontSize:'2rem', marginBottom:'8px' }}>🔔</div>
            <div>No hay alertas pendientes</div>
          </div>
        ) : (
          alertas.map(a => {
            const cfg = prioridadConfig[a.prioridad] || prioridadConfig.media
            return (
              <div key={a.id} style={{ background:'white', borderRadius:'14px', border:`0.5px solid var(--gris-borde)`, borderLeft:`3px solid ${a.leida ? 'var(--gris-borde)' : cfg.color}`, padding:'1rem 1.25rem', marginBottom:'0.75rem', opacity: a.leida ? 0.6 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', flex:1 }}>
                    <div style={{ fontSize:'1.25rem', lineHeight:1, marginTop:'2px' }}>{cfg.icono}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--texto-sec)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'3px' }}>{a.tipo}</div>
                      <div style={{ fontSize:'14px', color:'var(--texto)', lineHeight:1.4, marginBottom:'4px' }}>{a.mensaje}</div>
                      <div style={{ fontSize:'11px', color:'var(--texto-sec)' }}>
                        {a.finca && <span>{a.finca} — </span>}
                        {a.origen && <span>{a.origen} — </span>}
                        <span>{formatTiempo(a.creado_en)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                    <Badge style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</Badge>
                    {!a.leida && (
                      <button onClick={() => marcarLeida(a.id)} style={{ fontSize:'11px', padding:'4px 10px', borderRadius:'20px', border:'0.5px solid var(--gris-borde-med)', background:'var(--gris)', color:'var(--texto-sec)', cursor:'pointer' }}>
                        ✓ Leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </PageBody>
    </PageLayout>
  )

  return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo="Nueva alerta"
        onVolver={() => setVista('lista')}
      />
      <PageBody>
        <Card>
          <div style={{ marginBottom:'14px' }}>
            <div style={sh.grupoLabel}>Finca (opcional)</div>
            <div style={sh.fincasGrid}>
              {['', ...FINCAS].map(f => (
                <button key={f} onClick={() => setForm(p => ({ ...p, finca: f }))}
                  style={{ ...sh.fincaChip, ...(form.finca === f ? sh.fincaChipOn : {}) }}>
                  {f || 'Todas'}
                </button>
              ))}
            </div>
          </div>

          <Input label="Tipo de alerta *" value={form.tipo}
            onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
            placeholder="Ej: Animal enfermo, Cerca dañada..." />

          <Textarea label="Mensaje *" value={form.mensaje}
            onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
            placeholder="Describe la situación con detalle..." rows={3} />

          <div style={{ marginBottom:'12px' }}>
            <div style={sh.grupoLabel}>Prioridad</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {PRIORIDADES.map(p => {
                const cfg = prioridadConfig[p]
                return (
                  <button key={p} onClick={() => setForm(prev => ({ ...prev, prioridad: p }))}
                    style={{ padding:'10px 8px', borderRadius:'8px', border:`1.5px solid ${form.prioridad === p ? cfg.color : 'var(--gris-borde-med)'}`, background: form.prioridad === p ? cfg.bg : 'var(--gris)', fontSize:'13px', fontWeight:'500', cursor:'pointer', textAlign:'center', color: form.prioridad === p ? cfg.color : 'var(--texto)' }}>
                    {cfg.icono} {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Input label="Origen / Reportado por" value={form.origen}
            onChange={e => setForm(p => ({ ...p, origen: e.target.value }))}
            placeholder={perfil?.nombre || 'Nombre del responsable'} />
        </Card>
        <ButtonPrimary onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear alerta'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setVista('lista')}>Cancelar</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
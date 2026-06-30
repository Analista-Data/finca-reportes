import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usePartos } from '../../hooks/usePartos'
import { useGanado } from '../../hooks/useGanado'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Textarea, FincaSelector } from '../../components/ui/Input'
import { FINCAS } from '../../styles/theme'
import * as sh from '../../styles/shared'

export default function Partos() {
  const { perfil } = useAuth()
  const [vista, setVista] = useState('lista')
  const [filtroFinca, setFiltroFinca] = useState('')
  const [hembras, setHembras] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    finca:'', madre_id:'', padre_codigo:'',
    fecha_parto: new Date().toISOString().split('T')[0],
    tipo_parto:'normal',
    numero_vaca:'', peso_cria:'', color:'',
    ombligo:'normal', estado_general:'bueno',
    tratamientos_iniciales:'',
    observaciones:'', registrado_por:'',
    cria_codigo:'', cria_sexo:''
  })

  const { partos, cargando, stats, guardar } = usePartos(filtroFinca)
  const { buscarHembras } = useGanado()

  async function seleccionarFinca(finca) {
    setForm(p => ({ ...p, finca, madre_id:'' }))
    const data = await buscarHembras(finca)
    setHembras(data)
  }

  async function handleGuardar() {
    if (!form.finca) { alert('Selecciona una finca'); return }
    if (!form.fecha_parto) { alert('Ingresa la fecha del parto'); return }
    setGuardando(true)
    await guardar(form, perfil?.nombre)
    setGuardando(false)
    setVista('lista')
  }

  function formatFecha(f) {
    if (!f) return ''
    return new Date(f + 'T12:00:00').toLocaleDateString('es-CR', { day:'numeric', month:'short', year:'numeric' })
  }

  // ── VISTA LISTA ──
  if (vista === 'lista') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Partos\ny Cría'}
        derecha={<ButtonNuevo onClick={() => setVista('form')}>+ Registrar</ButtonNuevo>}
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'total partos' },
          { valor: stats.esteMes, label:'este mes' },
          { valor: stats.normal, label:'normales' }
        ]} />
      </div>

      <PageBody>
        <select style={{ ...sh.select, marginBottom:'1rem' }} value={filtroFinca}
          onChange={e => setFiltroFinca(e.target.value)}>
          <option value="">Todas las fincas</option>
          {FINCAS.map(f => <option key={f}>{f}</option>)}
        </select>

        {cargando ? (
          <div style={sh.estado}>Cargando partos...</div>
        ) : partos.length === 0 ? (
          <div style={sh.estado}>No hay partos registrados</div>
        ) : (
          partos.map(p => (
            <Card key={p.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'4px' }}>
                    🐣 Parto — {p.finca}
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{formatFecha(p.fecha_parto)}</div>
                  {p.madre && (
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>
                      Madre: {p.madre.codigo} {p.madre.nombre ? `— ${p.madre.nombre}` : ''}
                    </div>
                  )}
                  {p.cria && (
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>
                      Cría: {p.cria.codigo} ({p.cria.sexo})
                    </div>
                  )}
                  {p.registrado_por && (
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>
                      Por: {p.registrado_por}
                    </div>
                  )}
                </div>
                <Badge tipo={p.tipo_parto === 'normal' ? 'verde' : p.tipo_parto === 'distocico' ? 'amber' : 'rojo'}>
                  {p.tipo_parto}
                </Badge>
              </div>

              {/* Tags de estado */}
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom: p.observaciones ? '8px' : '0' }}>
                {p.estado_general && (
                  <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px',
                    background: p.estado_general === 'excelente' || p.estado_general === 'bueno' ? 'var(--verde-light)' : p.estado_general === 'regular' ? 'var(--amber-light)' : 'var(--rojo-light)',
                    color: p.estado_general === 'excelente' || p.estado_general === 'bueno' ? 'var(--verde-dark)' : p.estado_general === 'regular' ? 'var(--amber-dark)' : 'var(--rojo)'
                  }}>
                    {p.estado_general}
                  </span>
                )}
                {p.ombligo && p.ombligo !== 'normal' && (
                  <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--amber-light)', color:'var(--amber-dark)' }}>
                    ombligo {p.ombligo}
                  </span>
                )}
                {p.color && (
                  <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#f0f0f0', color:'#555' }}>
                    🎨 {p.color}
                  </span>
                )}
                {p.peso_cria && (
                  <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--verde-light)', color:'var(--verde-dark)' }}>
                    ⚖️ {p.peso_cria} kg
                  </span>
                )}
              </div>

              {p.tratamientos_iniciales && (
                <div style={{ padding:'7px 10px', background:'var(--amber-light)', borderRadius:'8px', fontSize:'12px', color:'var(--amber-dark)', marginBottom: p.observaciones ? '6px' : '0' }}>
                  💊 {p.tratamientos_iniciales}
                </div>
              )}
              {p.observaciones && (
                <div style={{ paddingTop:'8px', borderTop:'0.5px solid var(--gris-borde)', fontSize:'13px', color:'var(--texto-sec)', lineHeight:1.4 }}>
                  {p.observaciones}
                </div>
              )}
            </Card>
          ))
        )}
      </PageBody>
    </PageLayout>
  )

  // ── VISTA FORMULARIO ──
  return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo="Registrar parto"
        onVolver={() => setVista('lista')}
      />
      <PageBody>
        <Card>
          <FincaSelector value={form.finca} onChange={seleccionarFinca} />

          <div style={{ marginTop:'14px' }}>
            <Input label="Fecha del parto *" type="date" value={form.fecha_parto}
              onChange={e => setForm(p => ({ ...p, fecha_parto: e.target.value }))} />
          </div>

          {/* TIPO DE PARTO */}
          <div style={{ marginBottom:'12px' }}>
            <div style={sh.grupoLabel}>Tipo de parto</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {['normal','distocico','cesarea'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, tipo_parto: t }))}
                  style={{ flex:1, padding:'9px 6px', borderRadius:'8px', border:`1.5px solid ${form.tipo_parto === t ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.tipo_parto === t ? 'var(--verde-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', cursor:'pointer', color: form.tipo_parto === t ? 'var(--verde-dark)' : 'var(--texto)', textAlign:'center' }}>
                  {t === 'normal' ? '✅' : t === 'distocico' ? '⚠️' : '🏥'} {t}
                </button>
              ))}
            </div>
          </div>

          {/* MADRE */}
          {form.finca && (
            <Select label="Madre (opcional)" value={form.madre_id}
              onChange={e => setForm(p => ({ ...p, madre_id: e.target.value }))}>
              <option value="">Seleccionar madre</option>
              {hembras.map(h => (
                <option key={h.id} value={h.id}>{h.codigo} {h.nombre ? `— ${h.nombre}` : ''}</option>
              ))}
            </Select>
          )}

          <Input label="Número de vaca" value={form.numero_vaca}
            onChange={e => setForm(p => ({ ...p, numero_vaca: e.target.value }))}
            placeholder="Ej: 045" />

          <Input label="Código del padre (opcional)" value={form.padre_codigo}
            onChange={e => setForm(p => ({ ...p, padre_codigo: e.target.value }))}
            placeholder="Ej: BJ-TORO-01" />

          {/* DATOS DE LA CRÍA */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px', marginBottom:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>Datos de la cría</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Input label="Código / Arete" value={form.cria_codigo}
                onChange={e => setForm(p => ({ ...p, cria_codigo: e.target.value }))}
                placeholder="Ej: BJ-002" />
              <Select label="Sexo" value={form.cria_sexo}
                onChange={e => setForm(p => ({ ...p, cria_sexo: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="macho">🐂 Macho</option>
                <option value="hembra">🐄 Hembra</option>
              </Select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Input label="Peso cría (kg)" type="number" value={form.peso_cria}
                onChange={e => setForm(p => ({ ...p, peso_cria: e.target.value }))}
                placeholder="Ej: 35" />
              <Input label="Color" value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                placeholder="Ej: Negro, Pinto..." />
            </div>

            {/* OMBLIGO */}
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado del ombligo</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {['normal','inflamado','infectado','tratado'].map(o => (
                  <button key={o} onClick={() => setForm(p => ({ ...p, ombligo: o }))}
                    style={{ padding:'9px 8px', borderRadius:'8px', border:`1.5px solid ${form.ombligo === o ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.ombligo === o ? 'var(--verde-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', cursor:'pointer', color: form.ombligo === o ? 'var(--verde-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {o === 'normal' ? '✅' : o === 'inflamado' ? '⚠️' : o === 'infectado' ? '🔴' : '💊'} {o}
                  </button>
                ))}
              </div>
            </div>

            {/* ESTADO GENERAL */}
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado general</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {['excelente','bueno','regular','malo'].map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, estado_general: e }))}
                    style={{ padding:'9px 8px', borderRadius:'8px', border:`1.5px solid ${form.estado_general === e ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.estado_general === e ? 'var(--verde-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', cursor:'pointer', color: form.estado_general === e ? 'var(--verde-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {e === 'excelente' ? '🟢' : e === 'bueno' ? '🟡' : e === 'regular' ? '🟠' : '🔴'} {e}
                  </button>
                ))}
              </div>
            </div>

            <Textarea label="Tratamientos iniciales" value={form.tratamientos_iniciales}
              onChange={e => setForm(p => ({ ...p, tratamientos_iniciales: e.target.value }))}
              placeholder="Ej: Vitaminas, desparasitante, antibiótico..." rows={2} />
          </div>

          <Input label="Registrado por" value={form.registrado_por}
            onChange={e => setForm(p => ({ ...p, registrado_por: e.target.value }))}
            placeholder={perfil?.nombre || 'Nombre del responsable'} />

          <Textarea label="Observaciones generales" value={form.observaciones}
            onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
            placeholder="Complicaciones, estado de la madre, etc." />
        </Card>

        <ButtonPrimary onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Registrar parto'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setVista('lista')}>Cancelar</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
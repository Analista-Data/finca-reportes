import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTerreno } from '../../hooks/useTerreno'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Textarea, FincaSelector } from '../../components/ui/Input'
import { FINCAS } from '../../styles/theme'
import * as sh from '../../styles/shared'

const ESTADO_OPTIONS = ['excelente','bueno','regular','malo','seco']
const CERCAS_OPTIONS = ['bueno','regular','malo','requiere_reparacion']
const SAL_UNIDADES = ['kg','lb','bulto','saco']

export default function Terreno() {
  const { perfil } = useAuth()
  const [vista, setVista] = useState('lista')
  const [filtroFinca, setFiltroFinca] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [detalleAbierto, setDetalleAbierto] = useState(null)

  const [form, setForm] = useState({
    finca:'', fecha: new Date().toISOString().split('T')[0],
    rotacion_actual:'', radial_actual:'',
    sal_tipo:'', sal_cantidad:'', sal_unidad:'kg',
    agua_estado:'', agua_notas:'',
    cercas_estado:'', cercas_radial:'', cercas_notas:'',
    pasto_altura_entrada:'', pasto_altura_salida:'',
    proximo_radial:'', proximo_pasto_altura:'',
    proximo_agua_estado:'', proximo_cercas_estado:'',
    registrado_por: perfil?.nombre || '', notas:''
  })

  const { registros, cargando, stats, guardar, eliminar } = useTerreno(filtroFinca)

  async function handleGuardar() {
    if (!form.finca) { alert('Selecciona una finca'); return }
    if (!form.fecha) { alert('Ingresa la fecha'); return }
    setGuardando(true)
    await guardar(form)
    setGuardando(false)
    setVista('lista')
  }

  function formatFecha(f) {
    if (!f) return ''
    return new Date(f+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'})
  }

  const estadoColor = { excelente:'verde', bueno:'verde', regular:'amber', malo:'rojo', seco:'rojo', requiere_reparacion:'rojo' }

  const estadoIcono = { excelente:'🟢', bueno:'🟡', regular:'🟠', malo:'🔴', seco:'⚫', requiere_reparacion:'🔴' }

  // ── VISTA LISTA ──
  if (vista === 'lista') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Estado del\nTerreno'}
        derecha={<ButtonNuevo onClick={() => setVista('form')}>+ Registrar</ButtonNuevo>}
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'registros' },
          { valor: stats.esteMes, label:'este mes' },
          { valor: stats.requierenAtencion, label:'requieren atención', alerta: stats.requierenAtencion > 0 }
        ]} />
      </div>

      <PageBody>
        <select style={{ ...sh.select, marginBottom:'1rem' }} value={filtroFinca}
          onChange={e => setFiltroFinca(e.target.value)}>
          <option value="">Todas las fincas</option>
          {FINCAS.map(f => <option key={f}>{f}</option>)}
        </select>

        {cargando ? (
          <div style={sh.estado}>Cargando registros...</div>
        ) : registros.length === 0 ? (
          <div style={sh.estado}>
            <div style={{ fontSize:'2rem', marginBottom:'8px' }}>🌿</div>
            <div>No hay registros de terreno</div>
          </div>
        ) : (
          registros.map(r => (
            <Card key={r.id} style={{ cursor:'pointer' }}
              onClick={() => setDetalleAbierto(detalleAbierto === r.id ? null : r.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'3px' }}>
                    🌿 {r.finca}
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{formatFecha(r.fecha)}</div>
                  {r.rotacion_actual && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>🔄 Rotación: {r.rotacion_actual}</div>}
                  {r.radial_actual && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>📍 Radial: {r.radial_actual}</div>}
                  {r.registrado_por && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>Por: {r.registrado_por}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px', alignItems:'flex-end' }}>
                  {r.agua_estado && <Badge tipo={estadoColor[r.agua_estado] || 'gris'}>💧 {r.agua_estado}</Badge>}
                  {r.cercas_estado && r.cercas_estado !== 'bueno' && <Badge tipo={estadoColor[r.cercas_estado] || 'gris'}>🔒 {r.cercas_estado}</Badge>}
                </div>
              </div>

              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {r.pasto_altura_entrada && <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--verde-light)', color:'var(--verde-dark)' }}>🌱 Entrada: {r.pasto_altura_entrada}cm</span>}
                {r.pasto_altura_salida && <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--amber-light)', color:'var(--amber-dark)' }}>🌾 Salida: {r.pasto_altura_salida}cm</span>}
                {r.sal_cantidad && <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#F0F0F0', color:'#555' }}>🧂 Sal: {r.sal_cantidad} {r.sal_unidad}</span>}
              </div>

              {detalleAbierto === r.id && (
                <div style={{ marginTop:'12px' }}>
                  <div style={{ height:'0.5px', background:'var(--gris-borde)', marginBottom:'12px' }}></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    {[
                      { label:'Sal tipo', valor: r.sal_tipo },
                      { label:'Sal cantidad', valor: r.sal_cantidad ? `${r.sal_cantidad} ${r.sal_unidad}` : null },
                      { label:'Agua estado', valor: r.agua_estado ? `${estadoIcono[r.agua_estado]} ${r.agua_estado}` : null },
                      { label:'Agua notas', valor: r.agua_notas },
                      { label:'Cercas estado', valor: r.cercas_estado ? `${estadoIcono[r.cercas_estado]} ${r.cercas_estado}` : null },
                      { label:'Cercas radial', valor: r.cercas_radial },
                      { label:'Pasto entrada', valor: r.pasto_altura_entrada ? `${r.pasto_altura_entrada} cm` : null },
                      { label:'Pasto salida', valor: r.pasto_altura_salida ? `${r.pasto_altura_salida} cm` : null },
                      { label:'Próximo radial', valor: r.proximo_radial },
                      { label:'Próx. pasto', valor: r.proximo_pasto_altura ? `${r.proximo_pasto_altura} cm` : null },
                      { label:'Próx. agua', valor: r.proximo_agua_estado ? `${estadoIcono[r.proximo_agua_estado]} ${r.proximo_agua_estado}` : null },
                      { label:'Próx. cercas', valor: r.proximo_cercas_estado ? `${estadoIcono[r.proximo_cercas_estado]} ${r.proximo_cercas_estado}` : null },
                    ].filter(i => i.valor).map(i => (
                      <div key={i.label}>
                        <div style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--texto-sec)', marginBottom:'2px' }}>{i.label}</div>
                        <div style={{ fontSize:'13px', color:'var(--texto)' }}>{i.valor}</div>
                      </div>
                    ))}
                  </div>
                  {r.notas && (
                    <div style={{ marginTop:'10px', padding:'8px 10px', background:'var(--gris)', borderRadius:'8px', fontSize:'12px', color:'var(--texto-sec)' }}>
                      {r.notas}
                    </div>
                  )}
                  {(perfil?.rol === 'admin') && (
                    <button onClick={e => { e.stopPropagation(); if(window.confirm('¿Eliminar este registro?')) eliminar(r.id) }}
                      style={{ marginTop:'10px', padding:'6px 12px', borderRadius:'8px', border:'0.5px solid var(--rojo-light)', background:'var(--rojo-light)', color:'var(--rojo)', fontSize:'12px', cursor:'pointer' }}>
                      🗑 Eliminar
                    </button>
                  )}
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
        titulo="Registro de terreno"
        onVolver={() => setVista('lista')}
      />
      <PageBody>
        <Card>
          <FincaSelector value={form.finca} onChange={f => setForm(p => ({ ...p, finca: f }))} />

          <div style={{ marginTop:'14px' }}>
            <Input label="Fecha *" type="date" value={form.fecha}
              onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
          </div>

          {/* ROTACIÓN Y RADIAL */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>🔄 Rotación y Radial</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Input label="Rotación actual" value={form.rotacion_actual}
                onChange={e => setForm(p => ({ ...p, rotacion_actual: e.target.value }))}
                placeholder="Ej: Rotación 3" />
              <Input label="Radial actual" value={form.radial_actual}
                onChange={e => setForm(p => ({ ...p, radial_actual: e.target.value }))}
                placeholder="Ej: Radial A" />
            </div>
          </div>

          {/* SAL */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>🧂 Sal</div>
            <Input label="Tipo de sal" value={form.sal_tipo}
              onChange={e => setForm(p => ({ ...p, sal_tipo: e.target.value }))}
              placeholder="Ej: Sal mineralizada, sal común..." />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Input label="Cantidad" type="number" value={form.sal_cantidad}
                onChange={e => setForm(p => ({ ...p, sal_cantidad: e.target.value }))}
                placeholder="Ej: 50" />
              <Select label="Unidad" value={form.sal_unidad}
                onChange={e => setForm(p => ({ ...p, sal_unidad: e.target.value }))}>
                {SAL_UNIDADES.map(u => <option key={u}>{u}</option>)}
              </Select>
            </div>
          </div>

          {/* AGUA */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>💧 Agua</div>
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado del agua</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {ESTADO_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, agua_estado: e }))}
                    style={{ padding:'9px 8px', borderRadius:'8px', border:`1.5px solid ${form.agua_estado === e ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.agua_estado === e ? 'var(--verde-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', cursor:'pointer', color: form.agua_estado === e ? 'var(--verde-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {estadoIcono[e]} {e}
                  </button>
                ))}
              </div>
            </div>
            <Textarea label="Notas del agua" value={form.agua_notas}
              onChange={e => setForm(p => ({ ...p, agua_notas: e.target.value }))}
              placeholder="Observaciones sobre fuentes de agua, bebederos..." rows={2} />
          </div>

          {/* CERCAS */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>🔒 Cercas</div>
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado de cercas</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {CERCAS_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, cercas_estado: e }))}
                    style={{ padding:'9px 8px', borderRadius:'8px', border:`1.5px solid ${form.cercas_estado === e ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.cercas_estado === e ? 'var(--verde-light)' : 'var(--gris)', fontSize:'12px', fontWeight:'500', cursor:'pointer', color: form.cercas_estado === e ? 'var(--verde-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {estadoIcono[e] || '🔒'} {e.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Cercas radial" value={form.cercas_radial}
              onChange={e => setForm(p => ({ ...p, cercas_radial: e.target.value }))}
              placeholder="Ej: Radial B necesita reparación" />
            <Textarea label="Notas de cercas" value={form.cercas_notas}
              onChange={e => setForm(p => ({ ...p, cercas_notas: e.target.value }))}
              placeholder="Detalles sobre el estado de las cercas..." rows={2} />
          </div>

          {/* PASTO */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--verde-dark)', marginBottom:'12px' }}>🌱 Pasto — Radial actual</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <Input label="Altura entrada (cm)" type="number" value={form.pasto_altura_entrada}
                onChange={e => setForm(p => ({ ...p, pasto_altura_entrada: e.target.value }))}
                placeholder="Ej: 80" />
              <Input label="Altura salida (cm)" type="number" value={form.pasto_altura_salida}
                onChange={e => setForm(p => ({ ...p, pasto_altura_salida: e.target.value }))}
                placeholder="Ej: 15" />
            </div>
          </div>

          {/* PRÓXIMO RADIAL */}
          <div style={{ paddingTop:'12px', borderTop:'0.5px solid var(--gris-borde)', marginTop:'4px' }}>
            <div style={{ ...sh.grupoLabel, color:'var(--amber-dark)', marginBottom:'12px' }}>📋 Estado próximo radial</div>
            <Input label="Próximo radial" value={form.proximo_radial}
              onChange={e => setForm(p => ({ ...p, proximo_radial: e.target.value }))}
              placeholder="Ej: Radial B" />
            <Input label="Altura pasto esperada (cm)" type="number" value={form.proximo_pasto_altura}
              onChange={e => setForm(p => ({ ...p, proximo_pasto_altura: e.target.value }))}
              placeholder="Ej: 70" />
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado agua próximo radial</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {ESTADO_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, proximo_agua_estado: e }))}
                    style={{ padding:'8px 6px', borderRadius:'8px', border:`1.5px solid ${form.proximo_agua_estado === e ? 'var(--amber)' : 'var(--gris-borde-med)'}`, background: form.proximo_agua_estado === e ? 'var(--amber-light)' : 'var(--gris)', fontSize:'11px', fontWeight:'500', cursor:'pointer', color: form.proximo_agua_estado === e ? 'var(--amber-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {estadoIcono[e]} {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Estado cercas próximo radial</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {CERCAS_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(p => ({ ...p, proximo_cercas_estado: e }))}
                    style={{ padding:'8px 6px', borderRadius:'8px', border:`1.5px solid ${form.proximo_cercas_estado === e ? 'var(--amber)' : 'var(--gris-borde-med)'}`, background: form.proximo_cercas_estado === e ? 'var(--amber-light)' : 'var(--gris)', fontSize:'11px', fontWeight:'500', cursor:'pointer', color: form.proximo_cercas_estado === e ? 'var(--amber-dark)' : 'var(--texto)', textAlign:'center' }}>
                    {estadoIcono[e] || '🔒'} {e.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input label="Registrado por" value={form.registrado_por}
            onChange={e => setForm(p => ({ ...p, registrado_por: e.target.value }))}
            placeholder={perfil?.nombre || 'Nombre del responsable'} />

          <Textarea label="Notas generales" value={form.notas}
            onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
            placeholder="Cualquier observación adicional..." />
        </Card>

        <ButtonPrimary onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar registro'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setVista('lista')}>Cancelar</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
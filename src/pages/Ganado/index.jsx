import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useGanado } from '../../hooks/useGanado'
import { useTraslados } from '../../hooks/useTraslados'
import { useRotacion } from '../../hooks/useRotacion'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card, CardAcciones } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo, ButtonAccion } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Textarea, FincaSelector } from '../../components/ui/Input'
import { FINCAS, RAZAS, ESTADOS_GANADO } from '../../styles/theme'
import * as sh from '../../styles/shared'

const CATEGORIAS = ['Vaca','Novilla','Ternero','Ternera','Toro','Torete','Buey']
const ESTADOS_ROTACION = ['Activo','En tratamiento','En observación','Recuperado']

export default function Ganado() {
  const { perfil } = useAuth()

  // ── ESTADOS GENERALES ──
  const [vista, setVista] = useState('lista')
  const [tabGanado, setTabGanado] = useState('inventario')

  // ── ESTADOS INVENTARIO ──
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('activo')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    finca:'', codigo:'', nombre:'', sexo:'', raza:'',
    fecha_nacimiento:'', peso_kg:'', potrero:'', estado:'activo', notas:''
  })

  // ── ESTADOS ROTACIÓN ──
  const [guardandoRotacion, setGuardandoRotacion] = useState(false)
  const [formRotacion, setFormRotacion] = useState({
    finca:'', fecha: new Date().toISOString().split('T')[0],
    cantidad:'', categoria:'', estado:''
  })

  // ── ESTADOS TRASLADOS ──
  const [filtroFincaTraslado, setFiltroFincaTraslado] = useState('')
  const [guardandoTraslado, setGuardandoTraslado] = useState(false)
  const [ganadoFincaOrigen, setGanadoFincaOrigen] = useState([])
  const [formTraslado, setFormTraslado] = useState({
    ganado_id:'', finca_origen:'', finca_destino:'',
    fecha: new Date().toISOString().split('T')[0],
    motivo:'', responsable:'', notas:''
  })

  // ── HOOKS ──
  const { ganado, cargando, stats, guardar, cambiarEstado, buscarPorFinca } = useGanado(filtroFinca, filtroEstado)
  const { registros: rotaciones, cargando: cargandoRotacion, guardar: guardarRotacion } = useRotacion(filtroFinca)
  const { traslados, cargando: cargandoTraslados, guardar: guardarTraslado } = useTraslados(filtroFincaTraslado)

  // ── FILTRO BÚSQUEDA ──
  const ganadoFiltrado = ganado.filter(g =>
    !busqueda ||
    g.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    g.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    g.potrero?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── HANDLERS INVENTARIO ──
  function abrirNuevo() {
    setForm({ finca: perfil?.finca || '', codigo:'', nombre:'', sexo:'', raza:'',
      fecha_nacimiento:'', peso_kg:'', potrero:'', estado:'activo', notas:'' })
    setSeleccionado(null)
    setVista('form')
  }

  function abrirEditar(res) {
    setForm({ ...res, peso_kg: res.peso_kg || '', fecha_nacimiento: res.fecha_nacimiento || '' })
    setSeleccionado(res)
    setVista('form')
  }

  async function handleGuardar() {
    if (!form.finca) { alert('Selecciona una finca'); return }
    if (!form.codigo) { alert('Ingresa un código'); return }
    if (!form.sexo) { alert('Selecciona el sexo'); return }
    setGuardando(true)
    await guardar(form, seleccionado)
    setGuardando(false)
    setVista('lista')
  }

  // ── HANDLERS ROTACIÓN ──
  async function handleGuardarRotacion() {
    if (!formRotacion.finca) { alert('Selecciona una finca'); return }
    if (!formRotacion.fecha) { alert('Ingresa la fecha'); return }
    setGuardandoRotacion(true)
    await guardarRotacion(formRotacion)
    setGuardandoRotacion(false)
    setVista('lista')
    setTabGanado('rotacion')
  }

  // ── HANDLERS TRASLADOS ──
  async function handleGuardarTraslado() {
    if (!formTraslado.finca_origen) { alert('Selecciona la finca origen'); return }
    if (!formTraslado.finca_destino) { alert('Selecciona la finca destino'); return }
    if (!formTraslado.fecha) { alert('Ingresa la fecha'); return }
    setGuardandoTraslado(true)
    await guardarTraslado(formTraslado)
    setGuardandoTraslado(false)
    setVista('lista')
    setTabGanado('traslados')
  }

  const puedeEditar = perfil?.rol === 'admin' || perfil?.rol === 'veterinario' || perfil?.rol === 'vaquero'

  function formatFecha(f) {
    if (!f) return ''
    return new Date(f+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short',year:'numeric'})
  }

  // ══════════════════════════════════════
  // ── VISTA LISTA ──
  // ══════════════════════════════════════
  if (vista === 'lista') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Inventario\nde Ganado'}
        derecha={
          tabGanado === 'inventario' && puedeEditar
            ? <ButtonNuevo onClick={abrirNuevo}>+ Nuevo</ButtonNuevo>
            : tabGanado === 'rotacion'
            ? <ButtonNuevo onClick={() => setVista('rotacion')}>+ Registrar</ButtonNuevo>
            : tabGanado === 'traslados'
            ? <ButtonNuevo onClick={() => setVista('traslado')}>+ Trasladar</ButtonNuevo>
            : null
        }
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'total activo' },
          { valor: stats.machos, label:'machos' },
          { valor: stats.hembras, label:'hembras' }
        ]} />
      </div>

      <div style={{ background:'white', borderBottom:'0.5px solid var(--gris-borde)', overflowX:'auto' }}>
        <div style={{ display:'flex', padding:'0 1.25rem', minWidth:'max-content' }}>
          {[
            { key:'inventario', label:'🐄 Inventario' },
            { key:'rotacion',   label:'🔄 Rotación' },
            { key:'traslados',  label:'🚛 Traslados' }
          ].map(t => (
            <button key={t.key} onClick={() => setTabGanado(t.key)}
              style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', border:'none', background:'transparent', color: tabGanado === t.key ? 'var(--verde)' : 'var(--texto-sec)', borderBottom: tabGanado === t.key ? '2px solid var(--verde)' : '2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <PageBody>

        {/* ── TAB INVENTARIO ── */}
        {tabGanado === 'inventario' && <>
          <input style={{ ...sh.input, background:'white', marginBottom:'8px' }}
            placeholder="🔍 Buscar por código, nombre o potrero..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />

          <div style={sh.filtrosFila}>
            <select style={sh.select} value={filtroFinca} onChange={e => setFiltroFinca(e.target.value)}>
              <option value="">Todas las fincas</option>
              {FINCAS.map(f => <option key={f}>{f}</option>)}
            </select>
            <select style={sh.select} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {ESTADOS_GANADO.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
            </select>
          </div>

          {cargando ? (
            <div style={sh.estado}>Cargando ganado...</div>
          ) : ganadoFiltrado.length === 0 ? (
            <div style={sh.estado}>No hay registros con esos filtros</div>
          ) : (
            ganadoFiltrado.map(g => (
              <Card key={g.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <div style={{ fontSize:'2rem', lineHeight:1 }}>{g.sexo === 'macho' ? '🐂' : '🐄'}</div>
                    <div>
                      <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--texto)', marginBottom:'2px' }}>{g.codigo}</div>
                      <div style={{ fontSize:'13px', color:'var(--texto-sec)' }}>{g.nombre || 'Sin nombre'}</div>
                      <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>{g.raza} — {g.finca}</div>
                      {g.potrero && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>📍 {g.potrero}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Badge tipo={g.estado === 'activo' ? 'verde' : 'gris'}>{g.estado}</Badge>
                    {g.peso_kg && <div style={{ fontSize:'12px', fontWeight:'500', color:'var(--verde-dark)', marginTop:'4px' }}>{g.peso_kg} kg</div>}
                  </div>
                </div>
                {(perfil?.rol === 'admin' || perfil?.rol === 'veterinario') && (
                  <CardAcciones>
                    <ButtonAccion onClick={() => abrirEditar(g)}>✏️ Editar</ButtonAccion>
                    {g.estado === 'activo' && <>
                      <ButtonAccion onClick={() => cambiarEstado(g.id, 'vendido')}>💰 Vendido</ButtonAccion>
                      <ButtonAccion onClick={() => cambiarEstado(g.id, 'muerto')}>❌ Muerto</ButtonAccion>
                    </>}
                  </CardAcciones>
                )}
              </Card>
            ))
          )}
        </>}

        {/* ── TAB ROTACIÓN ── */}
        {tabGanado === 'rotacion' && <>
          <select style={{ ...sh.select, marginBottom:'1rem' }} value={filtroFinca}
            onChange={e => setFiltroFinca(e.target.value)}>
            <option value="">Todas las fincas</option>
            {FINCAS.map(f => <option key={f}>{f}</option>)}
          </select>

          {cargandoRotacion ? (
            <div style={sh.estado}>Cargando rotaciones...</div>
          ) : rotaciones.length === 0 ? (
            <div style={sh.estado}>No hay registros de rotación</div>
          ) : (
            rotaciones.map(r => (
              <Card key={r.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'3px' }}>
                      🔄 {r.categoria || 'Sin categoría'} — {r.finca}
                    </div>
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{formatFecha(r.fecha)}</div>
                    {r.cantidad && (
                      <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>
                        Cantidad: {r.cantidad} animales
                      </div>
                    )}
                  </div>
                  {r.estado && <Badge tipo="verde">{r.estado}</Badge>}
                </div>
              </Card>
            ))
          )}
        </>}

        {/* ── TAB TRASLADOS ── */}
        {tabGanado === 'traslados' && <>
          <select style={{ ...sh.select, marginBottom:'1rem' }} value={filtroFincaTraslado}
            onChange={e => setFiltroFincaTraslado(e.target.value)}>
            <option value="">Todas las fincas</option>
            {FINCAS.map(f => <option key={f}>{f}</option>)}
          </select>

          {cargandoTraslados ? (
            <div style={sh.estado}>Cargando traslados...</div>
          ) : traslados.length === 0 ? (
            <div style={sh.estado}>No hay traslados registrados</div>
          ) : (
            traslados.map(t => (
              <Card key={t.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'4px' }}>
                      🚛 {t.finca_origen} → {t.finca_destino}
                    </div>
                    {t.animal && (
                      <div style={{ fontSize:'13px', color:'var(--texto-sec)', marginBottom:'2px' }}>
                        {t.animal.sexo === 'macho' ? '🐂' : '🐄'} {t.animal.codigo} {t.animal.nombre ? `— ${t.animal.nombre}` : ''}
                      </div>
                    )}
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{formatFecha(t.fecha)}</div>
                    {t.motivo && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>Motivo: {t.motivo}</div>}
                    {t.responsable && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>Por: {t.responsable}</div>}
                  </div>
                  <Badge tipo="verde">Completado</Badge>
                </div>
                {t.notas && (
                  <div style={{ marginTop:'8px', fontSize:'12px', color:'var(--texto-sec)', lineHeight:1.4 }}>{t.notas}</div>
                )}
              </Card>
            ))
          )}
        </>}

      </PageBody>
    </PageLayout>
  )

  // ══════════════════════════════════════
  // ── VISTA FORMULARIO INVENTARIO ──
  // ══════════════════════════════════════
  if (vista === 'form') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={seleccionado ? 'Editar res' : 'Nueva res'}
        onVolver={() => setVista('lista')}
      />
      <PageBody>
        <Card>
          <FincaSelector value={form.finca} onChange={f => setForm(p => ({ ...p, finca: f }))} />
          <div style={{ marginTop:'14px' }}>
            <Input label="Código / Arete *" value={form.codigo}
              onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ej: BJ-001" />
          </div>
          <Input label="Nombre (opcional)" value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: La Negra" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <Select label="Sexo *" value={form.sexo} onChange={e => setForm(p => ({ ...p, sexo: e.target.value }))}>
              <option value="">Seleccionar</option>
              <option value="macho">🐂 Macho</option>
              <option value="hembra">🐄 Hembra</option>
            </Select>
            <Select label="Raza" value={form.raza} onChange={e => setForm(p => ({ ...p, raza: e.target.value }))}>
              <option value="">Seleccionar</option>
              {RAZAS.map(r => <option key={r}>{r}</option>)}
            </Select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <Input label="Fecha nacimiento" type="date" value={form.fecha_nacimiento}
              onChange={e => setForm(p => ({ ...p, fecha_nacimiento: e.target.value }))} />
            <Input label="Peso (kg)" type="number" value={form.peso_kg}
              onChange={e => setForm(p => ({ ...p, peso_kg: e.target.value }))} placeholder="Ej: 450" />
          </div>
          <Input label="Potrero" value={form.potrero}
            onChange={e => setForm(p => ({ ...p, potrero: e.target.value }))} placeholder="Ej: Potrero Norte" />
          <Textarea label="Notas" value={form.notas}
            onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observaciones adicionales..." />
        </Card>
        <ButtonPrimary onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : seleccionado ? 'Guardar cambios' : 'Registrar res'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setVista('lista')}>Cancelar</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )

  // ══════════════════════════════════════
  // ── VISTA FORMULARIO ROTACIÓN ──
  // ══════════════════════════════════════
  if (vista === 'rotacion') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo="Registro de rotación"
        onVolver={() => { setVista('lista'); setTabGanado('rotacion') }}
      />
      <PageBody>
        <Card>
          <FincaSelector value={formRotacion.finca}
            onChange={f => setFormRotacion(p => ({ ...p, finca: f }))} />
          <div style={{ marginTop:'14px' }}>
            <Input label="Fecha *" type="date" value={formRotacion.fecha}
              onChange={e => setFormRotacion(p => ({ ...p, fecha: e.target.value }))} />
          </div>
          <Input label="Cantidad de animales" type="number" value={formRotacion.cantidad}
            onChange={e => setFormRotacion(p => ({ ...p, cantidad: e.target.value }))}
            placeholder="Ej: 25" />
          <Select label="Categoría" value={formRotacion.categoria}
            onChange={e => setFormRotacion(p => ({ ...p, categoria: e.target.value }))}>
            <option value="">Seleccionar</option>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select label="Estado" value={formRotacion.estado}
            onChange={e => setFormRotacion(p => ({ ...p, estado: e.target.value }))}>
            <option value="">Seleccionar</option>
            {ESTADOS_ROTACION.map(e => <option key={e}>{e}</option>)}
          </Select>
        </Card>
        <ButtonPrimary onClick={handleGuardarRotacion} disabled={guardandoRotacion}>
          {guardandoRotacion ? 'Guardando...' : 'Guardar rotación'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => { setVista('lista'); setTabGanado('rotacion') }}>
          Cancelar
        </ButtonSecondary>
      </PageBody>
    </PageLayout>
  )

  // ══════════════════════════════════════
  // ── VISTA FORMULARIO TRASLADO ──
  // ══════════════════════════════════════
  if (vista === 'traslado') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo="Traslado de animal"
        onVolver={() => { setVista('lista'); setTabGanado('traslados') }}
      />
      <PageBody>
        <Card>
          <div style={{ marginBottom:'14px' }}>
            <div style={sh.grupoLabel}>Finca origen</div>
            <div style={sh.fincasGrid}>
              {FINCAS.map(f => (
                <button key={f} onClick={async () => {
                  setFormTraslado(p => ({ ...p, finca_origen: f, ganado_id:'' }))
                  const data = await buscarPorFinca(f)
                  setGanadoFincaOrigen(data)
                }}
                  style={{ ...sh.fincaChip, ...(formTraslado.finca_origen === f ? sh.fincaChipOn : {}) }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {formTraslado.finca_origen && (
            <Select label="Animal a trasladar (opcional)" value={formTraslado.ganado_id}
              onChange={e => setFormTraslado(p => ({ ...p, ganado_id: e.target.value }))}>
              <option value="">Seleccionar animal</option>
              {ganadoFincaOrigen.map(g => (
                <option key={g.id} value={g.id}>{g.codigo} {g.nombre ? `— ${g.nombre}` : ''}</option>
              ))}
            </Select>
          )}

          <div style={{ marginBottom:'14px' }}>
            <div style={sh.grupoLabel}>Finca destino</div>
            <div style={sh.fincasGrid}>
              {FINCAS.filter(f => f !== formTraslado.finca_origen).map(f => (
                <button key={f} onClick={() => setFormTraslado(p => ({ ...p, finca_destino: f }))}
                  style={{ ...sh.fincaChip, ...(formTraslado.finca_destino === f ? sh.fincaChipOn : {}) }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Input label="Fecha *" type="date" value={formTraslado.fecha}
            onChange={e => setFormTraslado(p => ({ ...p, fecha: e.target.value }))} />
          <Input label="Motivo del traslado" value={formTraslado.motivo}
            onChange={e => setFormTraslado(p => ({ ...p, motivo: e.target.value }))}
            placeholder="Ej: Cambio de potrero, venta, cuarentena..." />
          <Input label="Responsable" value={formTraslado.responsable}
            onChange={e => setFormTraslado(p => ({ ...p, responsable: e.target.value }))}
            placeholder={perfil?.nombre || 'Nombre del responsable'} />
          <Textarea label="Notas" value={formTraslado.notas}
            onChange={e => setFormTraslado(p => ({ ...p, notas: e.target.value }))}
            placeholder="Observaciones adicionales..." />
        </Card>
        <ButtonPrimary onClick={handleGuardarTraslado} disabled={guardandoTraslado}>
          {guardandoTraslado ? 'Guardando...' : 'Registrar traslado'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => { setVista('lista'); setTabGanado('traslados') }}>
          Cancelar
        </ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUsuarios } from '../../hooks/useUsuarios'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo, ButtonAccion } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import { FINCAS } from '../../styles/theme'
import * as sh from '../../styles/shared'

const ROLES = ['admin','veterinario','vaquero','contador']
const MODULOS = ['reportes','ganado','partos','salud','terreno','alertas','usuarios']
const MODULOS_ICONOS = {
  reportes:'📊', ganado:'🐄', partos:'🐣',
  salud:'💉', terreno:'🌿', alertas:'🔔', usuarios:'👥'
}
const PERMISOS_CAMPOS = [
  { key:'puede_ver',      label:'Ver' },
  { key:'puede_crear',    label:'Crear' },
  { key:'puede_editar',   label:'Editar' },
  { key:'puede_eliminar', label:'Eliminar' }
]

export default function Usuarios() {
  const { perfil } = useAuth()
  const [tab, setTab] = useState('lista')
  const [vista, setVista] = useState('usuarios')
  const [seleccionado, setSeleccionado] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [rolPermisos, setRolPermisos] = useState('vaquero')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [pidiendoPassword, setPidiendoPassword] = useState(false)
  const [passwordAdmin, setPasswordAdmin] = useState('')

  const [form, setForm] = useState({
  nombre:'', cedula:'', correo_real:'', password:'', rol:'vaquero',
  finca:'', telefono:''
  })

  const [formEdit, setFormEdit] = useState({
    nombre:'', rol:'vaquero', finca:'', telefono:'', activo: true
  })

  const {
    usuarios, cargando, stats,
    crearUsuario, actualizarPerfil, toggleActivo,
    actualizarPermiso, permisosDeRol
  } = useUsuarios()

  function iniciarCreacion() {
  if (!form.nombre.trim()) { setError('Ingresa el nombre'); return }
  if (!form.cedula.trim()) { setError('Ingresa el número de cédula'); return }
  if (!form.password || form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
  setError('')
  setPidiendoPassword(true)
  }

  async function confirmarCreacion() {
  if (!passwordAdmin) { setError('Ingresa tu contraseña de administrador'); return }
  setError('')
  setGuardando(true)
  const { error } = await crearUsuario(form.cedula, form.password, form, {
    email: perfil?.email,
    password: passwordAdmin
  })
  setGuardando(false)
  setPasswordAdmin('')
  setPidiendoPassword(false)
  if (error) {
    setError('Error al crear usuario: ' + error.message)
  } else {
    setExito('Usuario creado correctamente')
    setForm({ nombre:'', cedula:'', correo_real:'', password:'', rol:'vaquero', finca:'', telefono:'' })
    setTimeout(() => setExito(''), 3000)
    setTab('lista')
  }
}

  async function handleActualizar() {
    if (!formEdit.nombre.trim()) { setError('Ingresa el nombre'); return }
    setError('')
    setGuardando(true)
    await actualizarPerfil(seleccionado.id, formEdit)
    setGuardando(false)
    setExito('Usuario actualizado')
    setTimeout(() => setExito(''), 3000)
    setSeleccionado(null)
    setVista('usuarios')
  }

  function abrirEditar(u) {
    setFormEdit({
      nombre: u.nombre || '',
      rol: u.rol || 'vaquero',
      finca: u.finca || '',
      telefono: u.telefono || '',
      activo: u.activo !== false
    })
    setSeleccionado(u)
    setVista('editar')
  }

  const rolColor = {
    admin: 'rojo', veterinario: 'verde',
    vaquero: 'amber', contador: 'gris'
  }

  const permisosRolActivo = permisosDeRol(rolPermisos)

  // ── VISTA EDITAR ──
  if (vista === 'editar' && seleccionado) return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo="Editar usuario"
        onVolver={() => { setSeleccionado(null); setVista('usuarios') }}
      />
      <PageBody>
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'1.25rem', paddingBottom:'1rem', borderBottom:'0.5px solid var(--gris-borde)' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'var(--verde-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
              👤
            </div>
            <div>
              <div style={{ fontSize:'15px', fontWeight:'600', color:'var(--texto)' }}>{seleccionado.nombre}</div>
              <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{seleccionado.email}</div>
            </div>
          </div>

          <Input label="Nombre completo *" value={formEdit.nombre}
            onChange={e => setFormEdit(p => ({ ...p, nombre: e.target.value }))}
            placeholder="Nombre del usuario" />

          <Select label="Rol *" value={formEdit.rol}
            onChange={e => setFormEdit(p => ({ ...p, rol: e.target.value }))}>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </Select>

          <div style={{ marginBottom:'12px' }}>
            <div style={sh.grupoLabel}>Finca asignada</div>
            <div style={sh.fincasGrid}>
              {['', ...FINCAS].map(f => (
                <button key={f} onClick={() => setFormEdit(p => ({ ...p, finca: f }))}
                  style={{ ...sh.fincaChip, ...(formEdit.finca === f ? sh.fincaChipOn : {}) }}>
                  {f || 'Todas'}
                </button>
              ))}
            </div>
          </div>

          <Input label="Teléfono" value={formEdit.telefono}
            onChange={e => setFormEdit(p => ({ ...p, telefono: e.target.value }))}
            placeholder="Ej: +506 8888-8888" />

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'4px' }}>
            <input type="checkbox" id="activo" checked={formEdit.activo}
              onChange={e => setFormEdit(p => ({ ...p, activo: e.target.checked }))}
              style={{ width:'18px', height:'18px', accentColor:'var(--verde)' }} />
            <label htmlFor="activo" style={{ fontSize:'14px', color:'var(--texto)' }}>
              Usuario activo
            </label>
          </div>
        </Card>

        {error && <div style={{ padding:'10px 14px', background:'var(--rojo-light)', color:'var(--rojo)', borderRadius:'8px', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}
        {exito && <div style={{ padding:'10px 14px', background:'var(--verde-light)', color:'var(--verde-dark)', borderRadius:'8px', fontSize:'13px', marginBottom:'10px' }}>✅ {exito}</div>}

        <ButtonPrimary onClick={handleActualizar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => { setSeleccionado(null); setVista('usuarios') }}>
          Cancelar
        </ButtonSecondary>
      </PageBody>
    </PageLayout>
  )

  // ── VISTA PRINCIPAL ──
  return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Usuarios y\nPermisos'}
        derecha={tab === 'lista' && <ButtonNuevo onClick={() => setTab('nuevo')}>+ Nuevo</ButtonNuevo>}
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'usuarios' },
          { valor: stats.activos, label:'activos' },
          { valor: stats.inactivos, label:'inactivos', alerta: stats.inactivos > 0 }
        ]} />
      </div>

      <div style={{ background:'white', borderBottom:'0.5px solid var(--gris-borde)', overflowX:'auto' }}>
        <div style={{ display:'flex', padding:'0 1.25rem', minWidth:'max-content' }}>
          {[
            { key:'lista',    label:'👥 Usuarios' },
            { key:'nuevo',    label:'➕ Nuevo usuario' },
            { key:'permisos', label:'🔐 Permisos por rol' }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', border:'none', background:'transparent', color: tab === t.key ? 'var(--verde)' : 'var(--texto-sec)', borderBottom: tab === t.key ? '2px solid var(--verde)' : '2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <PageBody>

        {/* ── TAB LISTA ── */}
        {tab === 'lista' && (
          cargando ? <div style={sh.estado}>Cargando usuarios...</div> :
          usuarios.length === 0 ? <div style={sh.estado}>No hay usuarios registrados</div> :
          usuarios.map(u => (
            <Card key={u.id} style={{ opacity: u.activo === false ? 0.6 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--verde-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                    👤
                  </div>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--texto)', marginBottom:'2px' }}>{u.nombre}</div>
                    <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>{u.cedula ? `Cédula: ${u.cedula}` : u.email}</div>
                    {u.finca && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'1px' }}>📍 {u.finca}</div>}
                    {u.telefono && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'1px' }}>📱 {u.telefono}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
                  <Badge tipo={rolColor[u.rol] || 'gris'}>{u.rol}</Badge>
                  {u.activo === false && <Badge tipo="gris">inactivo</Badge>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', paddingTop:'8px', borderTop:'0.5px solid var(--gris-borde)' }}>
                <ButtonAccion onClick={() => abrirEditar(u)}>✏️ Editar</ButtonAccion>
                <ButtonAccion onClick={() => toggleActivo(u.id, !u.activo)}
                  style={{ color: u.activo === false ? 'var(--verde)' : 'var(--rojo)', borderColor: u.activo === false ? 'var(--verde-light)' : 'var(--rojo-light)', background: u.activo === false ? 'var(--verde-light)' : 'var(--rojo-light)' }}>
                  {u.activo === false ? '✅ Activar' : '🚫 Desactivar'}
                </ButtonAccion>
              </div>
            </Card>
          ))
        )}

        {/* ── TAB NUEVO USUARIO ── */}
        {tab === 'nuevo' && (
          <Card>
            <div style={{ ...sh.grupoLabel, fontSize:'13px', marginBottom:'1rem', color:'var(--verde-dark)' }}>
              Crear nuevo usuario
            </div>

            <Input label="Nombre completo *" value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Carlos Méndez" />

            <Input label="Número de cédula *" value={form.cedula}
              onChange={e => setForm(p => ({ ...p, cedula: e.target.value }))}
              placeholder="Ej: 112345678" />

            <Input label="Correo electrónico (opcional)" type="email" value={form.correo_real}
              onChange={e => setForm(p => ({ ...p, correo_real: e.target.value }))}
              placeholder="Para notificaciones, opcional" />

            <Input label="Contraseña *" type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres" />

            <Select label="Rol *" value={form.rol}
              onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </Select>

            <div style={{ marginBottom:'12px' }}>
              <div style={sh.grupoLabel}>Finca asignada (opcional)</div>
              <div style={sh.fincasGrid}>
                {['', ...FINCAS].map(f => (
                  <button key={f} onClick={() => setForm(p => ({ ...p, finca: f }))}
                    style={{ ...sh.fincaChip, ...(form.finca === f ? sh.fincaChipOn : {}) }}>
                    {f || 'Todas'}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Teléfono (opcional)" value={form.telefono}
              onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="Ej: +506 8888-8888" />

            {error && <div style={{ padding:'10px 14px', background:'var(--rojo-light)', color:'var(--rojo)', borderRadius:'8px', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}
            {exito && <div style={{ padding:'10px 14px', background:'var(--verde-light)', color:'var(--verde-dark)', borderRadius:'8px', fontSize:'13px', marginBottom:'10px' }}>✅ {exito}</div>}

            <div style={{ marginTop:'4px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <ButtonPrimary onClick={iniciarCreacion} disabled={guardando}>
                {guardando ? 'Creando usuario...' : 'Crear usuario'}
              </ButtonPrimary>
              <ButtonSecondary onClick={() => { setForm({ nombre:'', cedula:'', correo_real:'', password:'', rol:'vaquero', finca:'', telefono:'' }); setError(''); setTab('lista') }}>
                Cancelar
              </ButtonSecondary>
            </div>
          </Card>
        )}

        {/* ── TAB PERMISOS ── */}
        {tab === 'permisos' && (
          <>
            <div style={{ marginBottom:'1rem' }}>
              <div style={sh.grupoLabel}>Selecciona el rol a configurar</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRolPermisos(r)}
                    style={{ ...sh.fincaChip, ...(rolPermisos === r ? sh.fincaChipOn : {}) }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Card style={{ padding:'0' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr repeat(4, 52px)', gap:'4px', padding:'10px 14px', borderBottom:'0.5px solid var(--gris-borde)', background:'var(--gris)', borderRadius:'14px 14px 0 0' }}>
                <div style={{ fontSize:'11px', fontWeight:'600', color:'var(--texto-sec)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Módulo</div>
                {PERMISOS_CAMPOS.map(c => (
                  <div key={c.key} style={{ fontSize:'10px', fontWeight:'600', color:'var(--texto-sec)', textTransform:'uppercase', textAlign:'center', letterSpacing:'0.04em' }}>{c.label}</div>
                ))}
              </div>

              {MODULOS.map((modulo, i) => {
                const permisoFila = permisosRolActivo.find(p => p.modulo === modulo)
                return (
                  <div key={modulo} style={{ display:'grid', gridTemplateColumns:'1fr repeat(4, 52px)', gap:'4px', padding:'12px 14px', borderBottom: i < MODULOS.length - 1 ? '0.5px solid var(--gris-borde)' : 'none', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'16px' }}>{MODULOS_ICONOS[modulo]}</span>
                      <span style={{ fontSize:'13px', fontWeight:'500', color:'var(--texto)', textTransform:'capitalize' }}>{modulo}</span>
                    </div>
                    {PERMISOS_CAMPOS.map(c => (
                      <div key={c.key} style={{ display:'flex', justifyContent:'center' }}>
                        <input
                          type="checkbox"
                          checked={permisoFila?.[c.key] || false}
                          onChange={e => {
                            if (rolPermisos === 'admin') return
                            actualizarPermiso(rolPermisos, modulo, c.key, e.target.checked)
                          }}
                          disabled={rolPermisos === 'admin'}
                          style={{ width:'18px', height:'18px', accentColor:'var(--verde)', cursor: rolPermisos === 'admin' ? 'not-allowed' : 'pointer' }}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}
            </Card>

            {rolPermisos === 'admin' && (
              <div style={{ marginTop:'10px', padding:'10px 14px', background:'var(--amber-light)', borderRadius:'8px', fontSize:'12px', color:'var(--amber-dark)' }}>
                ⚠️ Los permisos del administrador no se pueden modificar — tiene acceso total al sistema.
              </div>
            )}

            <div style={{ marginTop:'10px', padding:'10px 14px', background:'var(--verde-light)', borderRadius:'8px', fontSize:'12px', color:'var(--verde-dark)' }}>
              ✅ Los cambios en permisos se guardan automáticamente.
            </div>
          </>
        )}

      </PageBody>

      {/* MODAL CONFIRMAR CONTRASEÑA ADMIN */}
      {pidiendoPassword && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:500, padding:'1.5rem'
        }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'1.5rem', width:'100%', maxWidth:'380px' }}>
            <div style={{ fontSize:'16px', fontWeight:'600', color:'var(--texto)', marginBottom:'8px' }}>
              Confirma tu identidad
            </div>
            <div style={{ fontSize:'13px', color:'var(--texto-sec)', marginBottom:'1rem', lineHeight:1.4 }}>
              Para crear este usuario necesitamos verificar tu contraseña de administrador. Esto evita que pierdas tu sesión actual.
            </div>
            <Input label="Tu contraseña de administrador" type="password"
              value={passwordAdmin} onChange={e => setPasswordAdmin(e.target.value)}
              placeholder="••••••••" />
            {error && <div style={{ padding:'10px 14px', background:'var(--rojo-light)', color:'var(--rojo)', borderRadius:'8px', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}
            <ButtonPrimary onClick={confirmarCreacion} disabled={guardando}>
              {guardando ? 'Creando...' : 'Confirmar y crear usuario'}
            </ButtonPrimary>
            <ButtonSecondary onClick={() => { setPidiendoPassword(false); setPasswordAdmin(''); setError('') }}>
              Cancelar
            </ButtonSecondary>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
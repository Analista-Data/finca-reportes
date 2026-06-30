import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSalud } from '../../hooks/useSalud'
import { useGanado } from '../../hooks/useGanado'
import { PageLayout, PageHeader, PageBody, PageStats } from '../../components/layout/PageHeader'
import { Card, CardAcciones } from '../../components/ui/Card'
import { ButtonPrimary, ButtonSecondary, ButtonNuevo, ButtonAccion } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Textarea, FincaSelector } from '../../components/ui/Input'
import { FINCAS, TIPOS_SALUD, saludTipoConfig } from '../../styles/theme'
import * as sh from '../../styles/shared'

export default function Salud() {
  const { perfil } = useAuth()
  const [vista, setVista] = useState('lista')
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [ganado, setGanado] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    finca:'', ganado_id:'', tipo:'vacuna',
    descripcion:'', fecha: new Date().toISOString().split('T')[0],
    veterinario:'', medicamento:'', dosis:'',
    proxima_fecha:'', resuelto: false
  })

  const { registros, cargando, stats, guardar, marcarResuelto } = useSalud(filtroFinca, filtroTipo)
  const { buscarPorFinca } = useGanado()

  async function seleccionarFinca(finca) {
    setForm(p => ({ ...p, finca, ganado_id:'' }))
    const data = await buscarPorFinca(finca)
    setGanado(data)
  }

  async function handleGuardar() {
    if (!form.finca) { alert('Selecciona una finca'); return }
    if (!form.descripcion.trim()) { alert('Ingresa una descripción'); return }
    if (!form.fecha) { alert('Ingresa la fecha'); return }
    setGuardando(true)
    await guardar(form)
    setGuardando(false)
    setVista('lista')
  }

  function formatFecha(f) {
    if (!f) return ''
    return new Date(f + 'T12:00:00').toLocaleDateString('es-CR', { day:'numeric', month:'short', year:'numeric' })
  }

  if (vista === 'lista') return (
    <PageLayout>
      <PageHeader
        etiqueta="Agropecuaria Bajogrande"
        titulo={'Salud\nAnimal'}
        derecha={(perfil?.rol === 'admin' || perfil?.rol === 'veterinario') &&
          <ButtonNuevo onClick={() => setVista('form')}>+ Registrar</ButtonNuevo>}
      />
      <div style={{ background:'var(--verde)', padding:'0 1.25rem 1.25rem' }}>
        <PageStats stats={[
          { valor: stats.total, label:'registros' },
          { valor: stats.pendientes, label:'enfermedades', alerta: stats.pendientes > 0 },
          { valor: stats.proximas, label:'próx. 7 días', alerta: stats.proximas > 0 }
        ]} />
      </div>
      <PageBody>
        <div style={sh.filtrosFila}>
          <select style={sh.select} value={filtroFinca} onChange={e => setFiltroFinca(e.target.value)}>
            <option value="">Todas las fincas</option>
            {FINCAS.map(f => <option key={f}>{f}</option>)}
          </select>
          <select style={sh.select} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_SALUD.map(t => <option key={t} value={t}>{saludTipoConfig[t].icono} {t}</option>)}
          </select>
        </div>

        {cargando ? (
          <div style={sh.estado}>Cargando registros...</div>
        ) : registros.length === 0 ? (
          <div style={sh.estado}>No hay registros con esos filtros</div>
        ) : (
          registros.map(r => {
            const cfg = saludTipoConfig[r.tipo]
            return (
              <Card key={r.id} style={{ opacity: r.resuelto ? 0.65 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', flex:1 }}>
                    <div style={{ fontSize:'1.5rem', lineHeight:1, marginTop:'2px' }}>{cfg.icono}</div>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:'500', color:'var(--texto)', marginBottom:'4px', lineHeight:1.3 }}>{r.descripcion}</div>
                      {r.animal && <div style={{ fontSize:'12px', color:'var(--texto-sec)' }}>Animal: {r.animal.codigo} {r.animal.nombre ? `— ${r.animal.nombre}` : ''}</div>}
                      <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>{r.finca} — {formatFecha(r.fecha)}</div>
                      {r.veterinario && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>Dr. {r.veterinario}</div>}
                      {r.medicamento && <div style={{ fontSize:'12px', color:'var(--texto-sec)', marginTop:'2px' }}>💊 {r.medicamento} {r.dosis ? `— ${r.dosis}` : ''}</div>}
                      {r.proxima_fecha && <div style={{ fontSize:'12px', color:'var(--amber)', marginTop:'2px' }}>📅 Próxima: {formatFecha(r.proxima_fecha)}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                    <Badge style={{ background: cfg.bg, color: cfg.color }}>{r.tipo}</Badge>
                    {r.resuelto && <Badge tipo="gris">resuelto</Badge>}
                  </div>
                </div>
                {!r.resuelto && r.tipo === 'enfermedad' && (perfil?.rol === 'admin' || perfil?.rol === 'veterinario') && (
                  <CardAcciones>
                    <ButtonAccion onClick={() => marcarResuelto(r.id)}>✅ Marcar resuelto</ButtonAccion>
                  </CardAcciones>
                )}
              </Card>
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
        titulo="Nuevo registro"
        onVolver={() => setVista('lista')}
      />
      <PageBody>
        <Card>
          <FincaSelector value={form.finca} onChange={seleccionarFinca} />

          <div style={{ marginTop:'14px', marginBottom:'12px' }}>
            <div style={sh.grupoLabel}>Tipo de registro</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {TIPOS_SALUD.map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, tipo: t }))}
                  style={{ padding:'10px 8px', borderRadius:'8px', border:`1.5px solid ${form.tipo === t ? 'var(--verde)' : 'var(--gris-borde-med)'}`, background: form.tipo === t ? 'var(--verde-light)' : 'var(--gris)', fontSize:'13px', fontWeight:'500', cursor:'pointer', textAlign:'center', color: form.tipo === t ? 'var(--verde-dark)' : 'var(--texto)' }}>
                  {saludTipoConfig[t].icono} {t}
                </button>
              ))}
            </div>
          </div>

          {form.finca && (
            <Select label="Animal (opcional)" value={form.ganado_id}
              onChange={e => setForm(p => ({ ...p, ganado_id: e.target.value }))}>
              <option value="">Seleccionar animal o dejar general</option>
              {ganado.map(g => (
                <option key={g.id} value={g.id}>{g.codigo} {g.nombre ? `— ${g.nombre}` : ''}</option>
              ))}
            </Select>
          )}

          <Textarea label="Descripción *" value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            placeholder="Describe el evento, diagnóstico o procedimiento..." />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <Input label="Fecha *" type="date" value={form.fecha}
              onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
            <Input label="Próxima fecha" type="date" value={form.proxima_fecha}
              onChange={e => setForm(p => ({ ...p, proxima_fecha: e.target.value }))} />
          </div>

          <Input label="Veterinario" value={form.veterinario}
            onChange={e => setForm(p => ({ ...p, veterinario: e.target.value }))}
            placeholder="Nombre del veterinario" />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <Input label="Medicamento" value={form.medicamento}
              onChange={e => setForm(p => ({ ...p, medicamento: e.target.value }))}
              placeholder="Ej: Ivermectina" />
            <Input label="Dosis" value={form.dosis}
              onChange={e => setForm(p => ({ ...p, dosis: e.target.value }))}
              placeholder="Ej: 5ml" />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'4px' }}>
            <input type="checkbox" id="resuelto" checked={form.resuelto}
              onChange={e => setForm(p => ({ ...p, resuelto: e.target.checked }))}
              style={{ width:'18px', height:'18px', accentColor:'var(--verde)' }} />
            <label htmlFor="resuelto" style={{ fontSize:'14px', color:'var(--texto)' }}>
              Marcar como resuelto
            </label>
          </div>
        </Card>
        <ButtonPrimary onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar registro'}
        </ButtonPrimary>
        <ButtonSecondary onClick={() => setVista('lista')}>Cancelar</ButtonSecondary>
      </PageBody>
    </PageLayout>
  )
}
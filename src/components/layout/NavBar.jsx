import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const MENU = [
  { path:'/panel',    icono:'📊', label:'Reportes',  roles:['admin','veterinario','contador'] },
  { path:'/vaquero',  icono:'📋', label:'Campo',      roles:['admin','vaquero'] },
  { path:'/ganado',   icono:'🐄', label:'Ganado',     roles:['admin','veterinario','vaquero'] },
  { path:'/terreno',  icono:'🌿', label:'Terreno',    roles:['admin','veterinario','vaquero'] },
  { path:'/partos',   icono:'🐣', label:'Partos',     roles:['admin','veterinario','vaquero'] },
  { path:'/salud',    icono:'💉', label:'Salud',      roles:['admin','veterinario'] },
  { path:'/alertas',  icono:'🔔', label:'Alertas',    roles:['admin','veterinario','contador'] },
  { path:'/usuarios', icono:'👥', label:'Usuarios',   roles:['admin'] },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil, logout } = useAuth()
  const [abierto, setAbierto] = useState(false)

  const items = MENU.filter(m => m.roles.includes(perfil?.rol))
  const itemActivo = items.find(m => m.path === location.pathname)

  function irA(path) {
    navigate(path)
    setAbierto(false)
  }

  return (
    <>
      {/* OVERLAY */}
      {abierto && (
        <div onClick={() => setAbierto(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          zIndex:200, backdropFilter:'blur(2px)'
        }} />
      )}

      {/* DRAWER LATERAL */}
      <div style={{
        position:'fixed', top:0, left:0, height:'100%',
        width: abierto ? '280px' : '0',
        background:'white', zIndex:300,
        transition:'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow:'hidden', boxShadow: abierto ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
      }}>
        <div style={{ width:'280px', height:'100%', display:'flex', flexDirection:'column' }}>

          {/* HEADER DRAWER */}
          <div style={{ background:'var(--verde)', padding:'3rem 1.25rem 1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:'11px', fontWeight:'500', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:'4px' }}>
                  Agropecuaria Bajogrande
                </div>
                <div style={{ fontSize:'20px', fontWeight:'500', color:'white', lineHeight:1.2 }}>
                  {perfil?.nombre || 'Usuario'}
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', marginTop:'3px', textTransform:'capitalize' }}>
                  {perfil?.rol} {perfil?.finca ? `— ${perfil.finca}` : ''}
                </div>
              </div>
              <button onClick={() => setAbierto(false)} style={{
                background:'rgba(255,255,255,0.15)', border:'none', color:'white',
                width:'32px', height:'32px', borderRadius:'50%', fontSize:'16px',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
              }}>✕</button>
            </div>
          </div>

          {/* ITEMS DEL MENÚ */}
          <div style={{ flex:1, overflowY:'auto', padding:'0.75rem 0' }}>
            {items.map(item => {
              const activo = location.pathname === item.path
              return (
                <button key={item.path} onClick={() => irA(item.path)}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    width:'100%', padding:'13px 1.25rem',
                    background: activo ? 'var(--verde-light)' : 'transparent',
                    border:'none', cursor:'pointer',
                    borderLeft: activo ? '3px solid var(--verde)' : '3px solid transparent',
                    transition:'all 0.15s'
                  }}>
                  <span style={{ fontSize:'20px', lineHeight:1 }}>{item.icono}</span>
                  <span style={{
                    fontSize:'14px', fontWeight: activo ? '600' : '400',
                    color: activo ? 'var(--verde-dark)' : 'var(--texto)'
                  }}>
                    {item.label}
                  </span>
                  {activo && <span style={{ marginLeft:'auto', color:'var(--verde)', fontSize:'12px' }}>●</span>}
                </button>
              )
            })}
          </div>

          {/* FOOTER DRAWER */}
          <div style={{ padding:'1rem 1.25rem', borderTop:'0.5px solid var(--gris-borde)' }}>
            <button onClick={() => { logout(); setAbierto(false) }}
              style={{
                display:'flex', alignItems:'center', gap:'12px',
                width:'100%', padding:'12px 14px',
                background:'var(--rojo-light)', border:'none',
                borderRadius:'10px', cursor:'pointer', color:'var(--rojo)'
              }}>
              <span style={{ fontSize:'18px' }}>🚪</span>
              <span style={{ fontSize:'14px', fontWeight:'500' }}>Cerrar sesión</span>
            </button>
          </div>

        </div>
      </div>

      {/* BARRA INFERIOR */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        background:'white', borderTop:'0.5px solid rgba(0,0,0,0.08)',
        display:'flex', alignItems:'center',
        padding:'8px 1rem calc(8px + env(safe-area-inset-bottom))',
        zIndex:100, gap:'8px'
      }}>
        {/* BOTÓN HAMBURGUESA */}
        <button onClick={() => setAbierto(true)} style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'5px', padding:'6px 10px', background:'none', border:'none', cursor:'pointer',
          minWidth:'44px'
        }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
            <div style={{ width:'18px', height:'2px', background:'var(--texto)', borderRadius:'2px' }}></div>
            <div style={{ width:'18px', height:'2px', background:'var(--texto)', borderRadius:'2px' }}></div>
            <div style={{ width:'18px', height:'2px', background:'var(--texto)', borderRadius:'2px' }}></div>
          </div>
          <span style={{ fontSize:'10px', fontWeight:'500', color:'var(--texto-sec)' }}>Menú</span>
        </button>

        {/* DIVISOR */}
        <div style={{ width:'0.5px', height:'32px', background:'var(--gris-borde)' }}></div>

        {/* MÓDULO ACTIVO */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:'10px', padding:'4px 8px' }}>
          {itemActivo ? (
            <>
              <span style={{ fontSize:'20px' }}>{itemActivo.icono}</span>
              <span style={{ fontSize:'14px', fontWeight:'500', color:'var(--texto)' }}>{itemActivo.label}</span>
            </>
          ) : (
            <span style={{ fontSize:'13px', color:'var(--texto-sec)' }}>Agropecuaria Bajogrande</span>
          )}
        </div>

        {/* ACCESO RÁPIDO — los 2 más usados según rol */}
        {items.slice(0, 2).map(item => {
          const activo = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                padding:'6px 10px', background: activo ? 'var(--verde-light)' : 'none',
                border:'none', cursor:'pointer', borderRadius:'10px', minWidth:'44px'
              }}>
              <span style={{ fontSize:'20px', lineHeight:1 }}>{item.icono}</span>
              <span style={{ fontSize:'10px', fontWeight:'500', color: activo ? 'var(--verde)' : 'var(--texto-sec)' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
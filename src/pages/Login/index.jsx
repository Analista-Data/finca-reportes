import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { colors } from '../../styles/theme'

export default function Login() {
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const valor = identificador.trim()

    // Buscar si el valor ingresado coincide con una cédula o un alias
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('cedula, alias')
      .or(`cedula.eq.${valor},alias.eq.${valor}`)
      .maybeSingle()

    let cedulaReal = valor
    if (perfil) {
      cedulaReal = perfil.cedula
    }

    const emailTecnico = `bajogrande.${cedulaReal}@gmail.com`
    const { error } = await login(emailTecnico, password)

    if (error) {
      setError('Usuario o contraseña incorrectos')
      setCargando(false)
      return
    }
    navigate('/')
  }

  return (
    <div style={s.page}>
      <div style={s.top}>
        <div style={s.logo}>🐄</div>
        <div style={s.empresa}>Agropecuaria Bajogrande</div>
        <div style={s.titulo}>Sistema de<br/>Gestión Ganadera</div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitulo}>Iniciar sesión</div>
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={s.grupo}>
            <label style={s.label}>Cédula o nombre de usuario</label>
            <input
              type="text"
              value={identificador}
              onChange={e => setIdentificador(e.target.value)}
              placeholder="Ej: 112345678 o carlos"
              style={s.input}
              required
            />
          </div>
          <div style={s.grupo}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={s.input}
              required
            />
          </div>
          <button type="submit" style={s.btn} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={s.footer}>Agropecuaria Bajogrande © {new Date().getFullYear()}</div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background: colors.verde, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem' },
  top: { textAlign:'center', marginBottom:'1.5rem' },
  logo: { fontSize:'3rem', marginBottom:'0.5rem' },
  empresa: { fontSize:'12px', fontWeight:'500', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:'6px' },
  titulo: { fontSize:'26px', fontWeight:'500', color:'white', lineHeight:1.2 },
  card: { background:'white', borderRadius:'16px', padding:'1.75rem', width:'100%', maxWidth:'380px' },
  cardTitulo: { fontSize:'16px', fontWeight:'500', color: colors.texto, marginBottom:'1.25rem' },
  error: { background: colors.rojoLight, color: colors.rojo, padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'1rem' },
  grupo: { marginBottom:'1rem' },
  label: { display:'block', fontSize:'12px', fontWeight:'500', color: colors.textoSec, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' },
  input: { width:'100%', padding:'12px 14px', border:`0.5px solid ${colors.grisBordeMed}`, borderRadius:'8px', fontSize:'14px', background: colors.gris, color: colors.texto },
  btn: { width:'100%', padding:'14px', background: colors.verde, color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'500', cursor:'pointer', marginTop:'0.5rem' },
  footer: { textAlign:'center', fontSize:'12px', color: colors.textoSec, marginTop:'1.5rem' }
}
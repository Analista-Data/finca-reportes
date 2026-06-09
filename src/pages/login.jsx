import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setCargando(false)
      return
    }

    // Verificar rol del usuario
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (perfil?.rol === 'encargado' || perfil?.rol === 'admin') {
      navigate('/panel')
    } else {
      navigate('/vaquero')
    }

    setCargando(false)
  }

  return (
    <div style={styles.contenedor}>
      <div style={styles.card}>
        <div style={styles.logo}>🐄</div>
        <h1 style={styles.titulo}>Reporte de Finca</h1>
        <p style={styles.sub}>Ingresa con tu cuenta</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.grupo}>
            <label style={styles.label}>Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.grupo}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'var(--gris)'
  },
  card: {
    background: 'var(--blanco)',
    borderRadius: 'var(--radio)',
    padding: '2rem',
    width: '100%',
    maxWidth: '380px',
    border: '0.5px solid var(--borde)'
  },
  logo: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  titulo: {
    fontSize: '22px',
    fontWeight: '600',
    textAlign: 'center',
    color: 'var(--texto)',
    marginBottom: '4px'
  },
  sub: {
    fontSize: '14px',
    color: 'var(--texto-sec)',
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  error: {
    background: 'var(--rojo-light)',
    color: 'var(--rojo)',
    padding: '10px 14px',
    borderRadius: 'var(--radio-sm)',
    fontSize: '13px',
    marginBottom: '1rem'
  },
  grupo: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--texto-sec)',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '0.5px solid var(--borde-med)',
    borderRadius: 'var(--radio-sm)',
    fontSize: '15px',
    background: 'var(--gris)',
    color: 'var(--texto)'
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'var(--verde)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radio)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem'
  }
}
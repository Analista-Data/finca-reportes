import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login/index'
import Vaquero from './pages/Vaquero/index'
import Panel from './pages/Panel/index'
import Ganado from './pages/Ganado/index'
import Partos from './pages/Partos/index'
import Salud from './pages/Salud/index'
import Alertas from './pages/Alertas/index'
import NavBar from './components/layout/NavBar'
import Terreno from './pages/Terreno/index'
import Usuarios from './pages/Usuarios/index'

function RutaProtegida({ children, roles }) {
  const { usuario, perfil, cargando } = useAuth()

  if (cargando) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--gris)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🐄</div>
        <div style={{ fontSize:'14px', color:'var(--texto-sec)' }}>Cargando sistema...</div>
      </div>
    </div>
  )

  if (!usuario) return <Navigate to="/login" />
  if (roles && perfil && !roles.includes(perfil.rol)) return <Navigate to="/" />

  return (
    <div style={{ paddingBottom:'70px' }}>
      {children}
      <NavBar />
    </div>
  )
}

function RutaInicio() {
  const { perfil, cargando } = useAuth()
  if (cargando) return null
  if (!perfil) return <Navigate to="/login" />
  if (perfil.rol === 'vaquero') return <Navigate to="/vaquero" />
  return <Navigate to="/panel" />
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RutaInicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vaquero" element={
          <RutaProtegida roles={['vaquero', 'admin']}>
            <Vaquero />
          </RutaProtegida>
        } />
        <Route path="/panel" element={
          <RutaProtegida roles={['admin', 'veterinario', 'contador']}>
            <Panel />
          </RutaProtegida>
        } />
        <Route path="/terreno" element={
          <RutaProtegida roles={['admin', 'veterinario', 'vaquero']}>
            <Terreno />
          </RutaProtegida>
        } />
        <Route path="/ganado" element={
          <RutaProtegida roles={['admin', 'veterinario', 'vaquero']}>
            <Ganado />
          </RutaProtegida>
        } />
        <Route path="/partos" element={
          <RutaProtegida roles={['admin', 'veterinario', 'vaquero']}>
            <Partos />
          </RutaProtegida>
        } />
        <Route path="/salud" element={
          <RutaProtegida roles={['admin', 'veterinario']}>
            <Salud />
          </RutaProtegida>
        } />
        <Route path="/alertas" element={
          <RutaProtegida roles={['admin', 'veterinario', 'contador']}>
            <Alertas />
          </RutaProtegida>
        } />
        <Route path="/usuarios" element={
          <RutaProtegida roles={['admin']}>
            <Usuarios />
          </RutaProtegida>
        } />
      </Routes>
    </HashRouter>
  )
}

export default App
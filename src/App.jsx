import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Vaquero from './pages/Vaquero'
import Panel from './pages/Panel'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/vaquero" />} />
        <Route path="/vaquero" element={<Vaquero />} />
        <Route path="/panel" element={<Panel />} />
      </Routes>
    </HashRouter>
  )
}

export default App
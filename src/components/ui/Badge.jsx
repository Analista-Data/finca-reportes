import * as sh from '../../styles/shared'
import { colors } from '../../styles/theme'

export function Badge({ children, tipo, style }) {
  const variantes = {
    verde:  sh.tagVerde,
    amber:  sh.tagAmber,
    rojo:   sh.tagRojo,
    gris:   sh.tagGris
  }
  return (
    <span style={{ ...sh.tag, ...(variantes[tipo] || variantes.gris), ...style }}>
      {children}
    </span>
  )
}

export function BadgeSeñal({ online }) {
  return (
    <div style={{
      ...sh.badge,
      background: online ? 'rgba(255,255,255,0.18)' : 'rgba(186,117,23,0.3)'
    }}>
      <span style={{
        ...sh.punto,
        background: online ? '#9FE1CB' : '#FAC775'
      }}></span>
      <span style={{ fontSize:'11px', color: colors.blanco, fontWeight:'500' }}>
        {online ? 'Con señal' : 'Sin señal'}
      </span>
    </div>
  )
}

export function BadgePendientes({ count }) {
  if (!count || count === 0) return null
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: '500',
      padding: '3px 10px',
      borderRadius: '20px',
      background: 'rgba(186,117,23,0.35)',
      color: '#FAEEDA'
    }}>
      {count} pendiente{count > 1 ? 's' : ''}
    </div>
  )
}
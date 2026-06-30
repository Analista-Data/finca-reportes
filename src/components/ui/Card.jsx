import * as sh from '../../styles/shared'

export function Card({ children, style }) {
  return (
    <div style={{ ...sh.card, ...style }}>
      {children}
    </div>
  )
}

export function CardAcciones({ children }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '0.5px solid var(--gris-borde)'
    }}>
      {children}
    </div>
  )
}
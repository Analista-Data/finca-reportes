import * as sh from '../../styles/shared'
import { colors } from '../../styles/theme'

export function ButtonPrimary({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...sh.btnMain, ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}>
      {children}
    </button>
  )
}

export function ButtonSecondary({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ ...sh.btnSec, ...style }}>
      {children}
    </button>
  )
}

export function ButtonNuevo({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ ...sh.btnNuevo, ...style }}>
      {children}
    </button>
  )
}

export function ButtonVolver({ onClick }) {
  return (
    <button onClick={onClick} style={sh.btnVolver}>
      ← Volver
    </button>
  )
}

export function ButtonAccion({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px',
      borderRadius: '8px',
      border: `0.5px solid ${colors.grisBordeMed}`,
      background: colors.gris,
      fontSize: '12px',
      cursor: 'pointer',
      color: colors.texto,
      ...style
    }}>
      {children}
    </button>
  )
}
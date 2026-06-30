import * as sh from '../../styles/shared'

export function Input({ label, value, onChange, placeholder, type = 'text', style }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <div style={sh.grupoLabel}>{label}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...sh.input, ...style }}
      />
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 2, style }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <div style={sh.grupoLabel}>{label}</div>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{ ...sh.input, minHeight: '72px', resize: 'vertical', lineHeight: 1.5, ...style }}
      />
    </div>
  )
}

export function Select({ label, value, onChange, children, style }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <div style={sh.grupoLabel}>{label}</div>}
      <select
        value={value}
        onChange={onChange}
        style={{ ...sh.select, ...style }}>
        {children}
      </select>
    </div>
  )
}

export function GrupoLabel({ children }) {
  return <div style={sh.grupoLabel}>{children}</div>
}

export function FincaSelector({ value, onChange }) {
  const FINCAS = ['La Florida', 'Montecarlo', 'Tesoro', 'Bajogrande', 'Pino']
  return (
    <div>
      <div style={sh.grupoLabel}>Finca</div>
      <div style={sh.fincasGrid}>
        {FINCAS.map(f => (
          <button key={f} onClick={() => onChange(f)}
            style={{ ...sh.fincaChip, ...(value === f ? sh.fincaChipOn : {}) }}>
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}
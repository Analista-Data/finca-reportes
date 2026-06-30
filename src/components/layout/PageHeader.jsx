import * as sh from '../../styles/shared'
import { ButtonVolver } from '../ui/Button'

export function PageHeader({ etiqueta, titulo, sub, derecha, onVolver }) {
  return (
    <div style={sh.cab}>
      {onVolver && (
        <div style={{ marginBottom: '10px' }}>
          <ButtonVolver onClick={onVolver} />
        </div>
      )}
      <div style={sh.cabFila}>
        <div>
          {etiqueta && <div style={sh.cabEtiqueta}>{etiqueta}</div>}
          <div style={sh.cabTitulo} dangerouslySetInnerHTML={{ __html: titulo.replace('\n', '<br/>') }} />
          {sub && <div style={sh.cabSub}>{sub}</div>}
        </div>
        {derecha && <div>{derecha}</div>}
      </div>
    </div>
  )
}

export function PageStats({ stats }) {
  return (
    <div style={sh.statsRow}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: 'contents' }}>
          {i > 0 && <div style={sh.statDivisor}></div>}
          <div style={sh.statItem}>
            <div style={{ ...sh.statNum, ...(s.alerta ? { color: '#FAC775' } : {}) }}>
              {s.valor}
            </div>
            <div style={sh.statLabel}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageBody({ children }) {
  return <div style={sh.body}>{children}</div>
}

export function PageLayout({ children, wide }) {
  return (
    <div style={wide ? sh.pagePanelWide : sh.page}>
      {children}
    </div>
  )
}
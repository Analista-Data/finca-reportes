import { colors, radius, font, spacing } from './theme'

export const page = {
  maxWidth: '600px',
  margin: '0 auto',
  minHeight: '100vh',
  background: colors.gris
}

export const pagePanelWide = {
  maxWidth: '900px',
  margin: '0 auto',
  minHeight: '100vh',
  background: colors.gris
}

export const cab = {
  background: colors.verde,
  padding: '3rem 1.25rem 1.25rem',
  position: 'relative',
  overflow: 'hidden'
}

export const cabFila = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
}

export const cabEtiqueta = {
  fontSize: font.xs,
  fontWeight: '500',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)',
  marginBottom: spacing.xs
}

export const cabTitulo = {
  fontSize: font.xxxl,
  fontWeight: '500',
  color: colors.blanco,
  lineHeight: 1.15
}

export const cabSub = {
  fontSize: font.sm,
  color: 'rgba(255,255,255,0.65)',
  marginTop: spacing.xs
}

export const statsRow = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(255,255,255,0.12)',
  borderRadius: radius.md,
  padding: '10px 0'
}

export const statItem = {
  flex: 1,
  textAlign: 'center'
}

export const statNum = {
  fontSize: '22px',
  fontWeight: '500',
  color: colors.blanco,
  lineHeight: 1.1
}

export const statLabel = {
  fontSize: font.xs,
  color: 'rgba(255,255,255,0.65)',
  marginTop: '2px'
}

export const statDivisor = {
  width: '0.5px',
  height: '32px',
  background: 'rgba(255,255,255,0.2)'
}

export const body = {
  padding: '1.25rem'
}

export const card = {
  background: colors.blanco,
  borderRadius: radius.lg,
  border: `0.5px solid ${colors.grisBorde}`,
  padding: '1rem 1.25rem',
  marginBottom: '0.75rem'
}

export const grupoLabel = {
  fontSize: font.xs,
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: colors.textoSec,
  marginBottom: spacing.sm
}

export const input = {
  width: '100%',
  padding: '11px 13px',
  border: `0.5px solid ${colors.grisBordeMed}`,
  borderRadius: radius.sm,
  fontSize: font.base,
  background: colors.gris,
  color: colors.texto
}

export const select = {
  width: '100%',
  padding: '9px 12px',
  border: `0.5px solid ${colors.grisBordeMed}`,
  borderRadius: radius.sm,
  fontSize: font.md,
  background: colors.blanco,
  color: colors.texto
}

export const fincasGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px'
}

export const fincaChip = {
  padding: '11px 8px',
  borderRadius: radius.sm,
  border: `1.5px solid ${colors.grisBordeMed}`,
  background: colors.gris,
  fontSize: font.md,
  fontWeight: '500',
  textAlign: 'center',
  color: colors.texto,
  cursor: 'pointer'
}

export const fincaChipOn = {
  background: colors.verdeLight,
  borderColor: colors.verde,
  color: colors.verdeDark
}

export const btnMain = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '15px',
  background: colors.verde,
  color: colors.blanco,
  border: 'none',
  borderRadius: radius.md,
  fontSize: font.lg,
  fontWeight: '500',
  marginBottom: '10px',
  cursor: 'pointer'
}

export const btnSec = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '13px',
  background: 'transparent',
  color: colors.textoSec,
  border: `0.5px solid ${colors.grisBordeMed}`,
  borderRadius: radius.md,
  fontSize: font.base,
  cursor: 'pointer'
}

export const btnNuevo = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: colors.blanco,
  fontSize: font.md,
  fontWeight: '500',
  padding: '8px 16px',
  borderRadius: '20px',
  cursor: 'pointer'
}

export const btnVolver = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.85)',
  fontSize: font.md,
  cursor: 'pointer',
  padding: '4px 0'
}

export const tag = {
  fontSize: font.xs,
  fontWeight: '500',
  padding: '3px 9px',
  borderRadius: '20px',
  display: 'inline-block',
  whiteSpace: 'nowrap'
}

export const tagVerde = {
  background: colors.verdeLight,
  color: colors.verdeDark
}

export const tagAmber = {
  background: colors.amberLight,
  color: colors.amberDark
}

export const tagRojo = {
  background: colors.rojoLight,
  color: colors.rojo
}

export const tagGris = {
  background: '#f0f0f0',
  color: '#888'
}

export const estado = {
  textAlign: 'center',
  padding: '3rem',
  color: colors.textoSec,
  fontSize: font.base
}

export const filtrosFila = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  marginBottom: '1rem'
}

export const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 10px',
  borderRadius: '20px'
}

export const punto = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  display: 'inline-block'
}
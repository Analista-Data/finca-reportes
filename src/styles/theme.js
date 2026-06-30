export const colors = {
  verde: '#1D9E75',
  verdeLight: '#E1F5EE',
  verdeDark: '#085041',
  verdeMid: '#0F6E56',
  amber: '#BA7517',
  amberLight: '#FAEEDA',
  amberDark: '#633806',
  rojo: '#A32D2D',
  rojoLight: '#FCEBEB',
  gris: '#f5f4f0',
  grisBorde: 'rgba(0,0,0,0.08)',
  grisBordeMed: 'rgba(0,0,0,0.14)',
  texto: '#1a1a1a',
  textoSec: '#888',
  blanco: '#ffffff'
}

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '14px',
  xl: '16px',
  full: '9999px'
}

export const font = {
  xs: '11px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '15px',
  xl: '18px',
  xxl: '26px',
  xxxl: '28px'
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px'
}

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.06)',
  modal: '0 4px 24px rgba(0,0,0,0.12)'
}

// Configuración de prioridades de alertas
export const prioridadConfig = {
  baja:    { icono:'🟢', bg:'#F0FFF4', color:'#166534', label:'Baja' },
  media:   { icono:'🟡', bg: colors.amberLight, color: colors.amberDark, label:'Media' },
  alta:    { icono:'🟠', bg:'#FFF7ED', color:'#C2410C', label:'Alta' },
  critica: { icono:'🔴', bg: colors.rojoLight, color: colors.rojo, label:'Crítica' }
}

// Configuración de tipos de salud animal
export const saludTipoConfig = {
  vacuna:      { icono:'💉', bg: colors.verdeLight, color: colors.verdeDark },
  enfermedad:  { icono:'🤒', bg: colors.rojoLight, color: colors.rojo },
  tratamiento: { icono:'💊', bg: colors.amberLight, color: colors.amberDark },
  revision:    { icono:'🔍', bg:'#EEF2FF', color:'#3730A3' }
}

// Datos compartidos
export const FINCAS = ['La Florida', 'Montecarlo', 'Tesoro', 'Bajogrande', 'Pino']
export const RAZAS = ['Brahman', 'Angus', 'Hereford', 'Simmental', 'Holstein', 'Jersey', 'Cebu', 'Criolla', 'Otra']
export const ESTADOS_GANADO = ['activo', 'vendido', 'muerto', 'transferido']
export const TIPOS_SALUD = ['vacuna', 'enfermedad', 'tratamiento', 'revision']
export const PRIORIDADES = ['baja', 'media', 'alta', 'critica']
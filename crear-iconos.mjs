import fs from 'fs'
import https from 'https'

// Descarga un ícono verde simple desde un servicio público
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="32" fill="#1D9E75"/>
  <text y="140" x="30" font-size="130" font-family="sans-serif">🐄</text>
</svg>`

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#1D9E75"/>
  <text y="380" x="60" font-size="360" font-family="sans-serif">🐄</text>
</svg>`

fs.writeFileSync('public/icon-192.svg', svg192)
fs.writeFileSync('public/icon-512.svg', svg512)
console.log('SVGs creados en public/')
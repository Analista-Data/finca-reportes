import { supabase } from './supabase'

const QUEUE_KEY = 'reportes_pendientes'

// Agregar reporte a la cola local
export function agregarACola(reporte) {
  const cola = obtenerCola()
  cola.push({ ...reporte, _id: Date.now(), _intentos: 0 })
  guardarCola(cola)
}

// Obtener cola actual
export function obtenerCola() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch { return [] }
}

// Guardar cola
function guardarCola(cola) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(cola))
  } catch(e) {}
}

// Sincronizar todos los pendientes con Supabase
export async function sincronizarPendientes() {
  const cola = obtenerCola()
  if (cola.length === 0) return { sincronizados: 0, fallidos: 0 }

  let sincronizados = 0
  let fallidos = 0
  const pendientes = []

  for (const reporte of cola) {
    try {
      const { _id, _intentos, ...payload } = reporte
      const { error } = await supabase.from('reportes').insert(payload)

      if (error) {
        // Si falla, lo dejamos en cola con un intento más
        pendientes.push({ ...reporte, _intentos: _intentos + 1 })
        fallidos++
      } else {
        sincronizados++
      }
    } catch {
      pendientes.push({ ...reporte, _intentos: reporte._intentos + 1 })
      fallidos++
    }
  }

  // Guardar solo los que fallaron
  guardarCola(pendientes)
  return { sincronizados, fallidos }
}

// Cuántos reportes hay pendientes
export function contarPendientes() {
  return obtenerCola().length
}

// Escuchar cuando recupera conexión y sincronizar automático
export function iniciarSyncAutomatico(onSincronizado) {
  window.addEventListener('online', async () => {
    const pendientes = contarPendientes()
    if (pendientes > 0) {
      const resultado = await sincronizarPendientes()
      if (onSincronizado) onSincronizado(resultado)
    }
  })
}
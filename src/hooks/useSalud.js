import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSalud(filtroFinca = '', filtroTipo = '') {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca, filtroTipo])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('salud_animal').select(`
      *,
      animal:ganado(codigo, nombre)
    `).order('fecha', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    if (filtroTipo) q = q.eq('tipo', filtroTipo)
    const { data } = await q
    setRegistros(data || [])
    setCargando(false)
  }

  async function guardar(form) {
    await supabase.from('salud_animal').insert({
      finca: form.finca,
      ganado_id: form.ganado_id || null,
      tipo: form.tipo,
      descripcion: form.descripcion,
      fecha: form.fecha,
      veterinario: form.veterinario || null,
      medicamento: form.medicamento || null,
      dosis: form.dosis || null,
      proxima_fecha: form.proxima_fecha || null,
      resuelto: form.resuelto
    })
    await cargar()
  }

  async function marcarResuelto(id) {
    await supabase.from('salud_animal').update({ resuelto: true }).eq('id', id)
    await cargar()
  }

  const stats = {
    total: registros.length,
    pendientes: registros.filter(r => !r.resuelto && r.tipo === 'enfermedad').length,
    proximas: registros.filter(r => {
      if (!r.proxima_fecha) return false
      return new Date(r.proxima_fecha) <= new Date(Date.now() + 7 * 86400000)
    }).length
  }

  return { registros, cargando, stats, guardar, marcarResuelto, recargar: cargar }
}
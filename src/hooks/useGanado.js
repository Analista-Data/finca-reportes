import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGanado(filtroFinca = '', filtroEstado = 'activo') {
  const [ganado, setGanado] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca, filtroEstado])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('ganado').select('*').order('creado_en', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    if (filtroEstado) q = q.eq('estado', filtroEstado)
    const { data } = await q
    setGanado(data || [])
    setCargando(false)
  }

  async function guardar(form, seleccionado) {
    const payload = {
      ...form,
      peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
      fecha_nacimiento: form.fecha_nacimiento || null
    }
    if (seleccionado) {
      await supabase.from('ganado').update(payload).eq('id', seleccionado.id)
    } else {
      await supabase.from('ganado').insert(payload)
    }
    await cargar()
  }

  async function cambiarEstado(id, estado) {
    await supabase.from('ganado').update({ estado }).eq('id', id)
    await cargar()
  }

  async function buscarHembras(finca) {
    const { data } = await supabase.from('ganado')
      .select('id, codigo, nombre')
      .eq('finca', finca)
      .eq('sexo', 'hembra')
      .eq('estado', 'activo')
      .order('codigo')
    return data || []
  }

  async function buscarPorFinca(finca) {
    const { data } = await supabase.from('ganado')
      .select('id, codigo, nombre')
      .eq('finca', finca)
      .eq('estado', 'activo')
      .order('codigo')
    return data || []
  }

  const stats = {
    total: ganado.filter(g => g.estado === 'activo').length,
    machos: ganado.filter(g => g.estado === 'activo' && g.sexo === 'macho').length,
    hembras: ganado.filter(g => g.estado === 'activo' && g.sexo === 'hembra').length
  }

  return { ganado, cargando, stats, guardar, cambiarEstado, buscarHembras, buscarPorFinca, recargar: cargar }
}
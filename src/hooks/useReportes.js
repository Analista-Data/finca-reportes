import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useReportes(filtroFinca = '', filtroFecha = '') {
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca, filtroFecha])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('reportes').select('*').order('creado_en', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    if (filtroFecha) q = q.eq('fecha', filtroFecha)
    const { data } = await q
    setReportes(data || [])
    setCargando(false)
  }

  const stats = {
    total: reportes.length,
    hoy: reportes.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length,
    conAudio: reportes.filter(r => r.tiene_audios).length
  }

  return { reportes, cargando, stats, recargar: cargar }
}
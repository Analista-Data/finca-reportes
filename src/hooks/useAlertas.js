import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAlertas(filtroFinca = '', filtroLeida = 'false') {
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca, filtroLeida])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('alertas').select('*').order('creado_en', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    if (filtroLeida !== '') q = q.eq('leida', filtroLeida === 'true')
    const { data } = await q
    setAlertas(data || [])
    setCargando(false)
  }

  async function marcarLeida(id) {
    await supabase.from('alertas').update({ leida: true }).eq('id', id)
    await cargar()
  }

  async function marcarTodasLeidas() {
    await supabase.from('alertas').update({ leida: true }).eq('leida', false)
    await cargar()
  }

  async function crear(form, perfilNombre) {
    await supabase.from('alertas').insert({
      finca: form.finca || null,
      tipo: form.tipo,
      mensaje: form.mensaje,
      prioridad: form.prioridad,
      origen: form.origen || perfilNombre || null,
      leida: false
    })
    await cargar()
  }

  const stats = {
    total: alertas.length,
    noleidas: alertas.filter(a => !a.leida).length,
    criticas: alertas.filter(a => a.prioridad === 'critica' && !a.leida).length
  }

  return { alertas, cargando, stats, marcarLeida, marcarTodasLeidas, crear, recargar: cargar }
}
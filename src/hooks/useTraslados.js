import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTraslados(filtroFinca = '') {
  const [traslados, setTraslados] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('traslados').select(`
      *,
      animal:ganado(codigo, nombre, sexo)
    `).order('fecha', { ascending: false })
    if (filtroFinca) q = q.or(`finca_origen.eq.${filtroFinca},finca_destino.eq.${filtroFinca}`)
    const { data } = await q
    setTraslados(data || [])
    setCargando(false)
  }

  async function guardar(form) {
    await supabase.from('traslados').insert({
      ganado_id:      form.ganado_id || null,
      finca_origen:   form.finca_origen,
      finca_destino:  form.finca_destino,
      fecha:          form.fecha,
      motivo:         form.motivo || null,
      responsable:    form.responsable || null,
      notas:          form.notas || null
    })
    // Actualizar finca del animal en ganado
    if (form.ganado_id) {
      await supabase.from('ganado').update({ finca: form.finca_destino }).eq('id', form.ganado_id)
    }
    await cargar()
  }

  const stats = {
    total: traslados.length,
    esteMes: traslados.filter(t => {
      const mes = new Date().toISOString().slice(0, 7)
      return t.fecha?.startsWith(mes)
    }).length
  }

  return { traslados, cargando, stats, guardar, recargar: cargar }
}
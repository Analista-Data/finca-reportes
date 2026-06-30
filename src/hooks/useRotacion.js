import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRotacion(filtroFinca = '') {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('rotacion').select('*').order('fecha', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    const { data } = await q
    setRegistros(data || [])
    setCargando(false)
  }

  async function guardar(form) {
    await supabase.from('rotacion').insert({
      finca:                 form.finca,
      fecha:                 form.fecha,
      cantidad:              form.cantidad ? parseInt(form.cantidad) : null,
      categoria:             form.categoria || null,
      estado:                form.estado || null,
      numero_vaca:           form.numero_vaca || null,
      peso_cria:             form.peso_cria ? parseFloat(form.peso_cria) : null,
      color:                 form.color || null,
      ombligo:               form.ombligo || null,
      estado_general:        form.estado_general || null,
      tratamientos_iniciales: form.tratamientos_iniciales || null,
      notas:                 form.notas || null,
      registrado_por:        form.registrado_por || null
    })
    await cargar()
  }

  async function eliminar(id) {
    await supabase.from('rotacion').delete().eq('id', id)
    await cargar()
  }

  const stats = {
    total: registros.length,
    esteMes: registros.filter(r => {
      const mes = new Date().toISOString().slice(0, 7)
      return r.fecha?.startsWith(mes)
    }).length,
    totalAnimales: registros.reduce((sum, r) => sum + (r.cantidad || 0), 0)
  }

  return { registros, cargando, stats, guardar, eliminar, recargar: cargar }
}
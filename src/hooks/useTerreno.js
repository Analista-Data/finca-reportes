import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTerreno(filtroFinca = '') {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('terreno').select('*').order('fecha', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    const { data } = await q
    setRegistros(data || [])
    setCargando(false)
  }

  async function guardar(form) {
    await supabase.from('terreno').insert({
      finca:                  form.finca,
      fecha:                  form.fecha,
      rotacion_actual:        form.rotacion_actual || null,
      radial_actual:          form.radial_actual || null,
      sal_tipo:               form.sal_tipo || null,
      sal_cantidad:           form.sal_cantidad ? parseFloat(form.sal_cantidad) : null,
      sal_unidad:             form.sal_unidad || null,
      agua_estado:            form.agua_estado || null,
      agua_notas:             form.agua_notas || null,
      cercas_estado:          form.cercas_estado || null,
      cercas_radial:          form.cercas_radial || null,
      cercas_notas:           form.cercas_notas || null,
      pasto_altura_entrada:   form.pasto_altura_entrada ? parseFloat(form.pasto_altura_entrada) : null,
      pasto_altura_salida:    form.pasto_altura_salida ? parseFloat(form.pasto_altura_salida) : null,
      proximo_radial:         form.proximo_radial || null,
      proximo_pasto_altura:   form.proximo_pasto_altura ? parseFloat(form.proximo_pasto_altura) : null,
      proximo_agua_estado:    form.proximo_agua_estado || null,
      proximo_cercas_estado:  form.proximo_cercas_estado || null,
      registrado_por:         form.registrado_por || null,
      notas:                  form.notas || null
    })
    await cargar()
  }

  async function eliminar(id) {
    await supabase.from('terreno').delete().eq('id', id)
    await cargar()
  }

  const stats = {
    total: registros.length,
    esteMes: registros.filter(r => r.fecha?.startsWith(new Date().toISOString().slice(0,7))).length,
    requierenAtencion: registros.filter(r =>
      r.agua_estado === 'malo' || r.agua_estado === 'seco' ||
      r.cercas_estado === 'malo' || r.cercas_estado === 'requiere_reparacion'
    ).length
  }

  return { registros, cargando, stats, guardar, eliminar, recargar: cargar }
}
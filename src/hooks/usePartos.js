import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePartos(filtroFinca = '') {
  const [partos, setPartos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [filtroFinca])

  async function cargar() {
    setCargando(true)
    let q = supabase.from('partos').select(`
      *,
      madre:ganado!partos_madre_id_fkey(codigo, nombre),
      cria:ganado!partos_cria_id_fkey(codigo, sexo)
    `).order('fecha_parto', { ascending: false })
    if (filtroFinca) q = q.eq('finca', filtroFinca)
    const { data } = await q
    setPartos(data || [])
    setCargando(false)
  }

  async function guardar(form, perfilNombre) {
    let cria_id = null
    if (form.cria_codigo) {
      const { data: criaData } = await supabase.from('ganado').insert({
        finca: form.finca,
        codigo: form.cria_codigo,
        sexo: form.cria_sexo || null,
        peso_kg: form.cria_peso ? parseFloat(form.cria_peso) : null,
        fecha_nacimiento: form.fecha_parto,
        estado: 'activo',
        notas: 'Registrada en módulo de partos'
      }).select().single()
      if (criaData) cria_id = criaData.id
    }
    await supabase.from('partos').insert({
      finca:                  form.finca,
      madre_id:               form.madre_id || null,
      padre_codigo:           form.padre_codigo || null,
      fecha_parto:            form.fecha_parto,
      tipo_parto:             form.tipo_parto,
      numero_vaca:            form.numero_vaca || null,
      peso_cria:              form.peso_cria ? parseFloat(form.peso_cria) : null,
      color:                  form.color || null,
      ombligo:                form.ombligo || null,
      estado_general:         form.estado_general || null,
      tratamientos_iniciales: form.tratamientos_iniciales || null,
      observaciones:          form.observaciones || null,
      registrado_por:         form.registrado_por || perfilNombre || null,
      cria_id
    })
    await cargar()
  }

  const stats = {
    total: partos.length,
    esteMes: partos.filter(p => {
      const mes = new Date().toISOString().slice(0, 7)
      return p.fecha_parto?.startsWith(mes)
    }).length,
    normal: partos.filter(p => p.tipo_parto === 'normal').length
  }

  return { partos, cargando, stats, guardar, recargar: cargar }
}
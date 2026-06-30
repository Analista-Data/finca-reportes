import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = 'https://oyhotpwtqoeqmxoelxlm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aG90cHd0cW9lcW14b2VseGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzE4NDcsImV4cCI6MjA5NTA0Nzg0N30.WwkBoTVbUd8yUGYP-ZCNCybuEZYVXeI4YVMAeMkJ180'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [permisos, setPermisos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const [{ data: perfiles }, { data: perms }] = await Promise.all([
      supabase.from('perfiles').select('*').order('nombre'),
      supabase.from('permisos').select('*').order('rol')
    ])
    setUsuarios(perfiles || [])
    setPermisos(perms || [])
    setCargando(false)
  }

  async function crearUsuario(cedula, password, datos) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/crear-usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
        cedula,
        alias: datos.alias,
        password,
        nombre: datos.nombre,
        rol: datos.rol,
        fincas: datos.fincas,
        telefono: datos.telefono,
        correo_real: datos.correo_real
      })
      })

      const result = await res.json()

      if (!res.ok) {
        return { error: { message: result.error || 'Error al crear usuario' } }
      }

      await cargar()
      return { error: null }
    } catch (err) {
      return { error: { message: err.message } }
    }
  }

  async function actualizarPerfil(id, datos) {
    await supabase.from('perfiles').update({
      nombre:   datos.nombre,
      rol:      datos.rol,
      fincas:   datos.fincas && datos.fincas.length > 0 ? datos.fincas : null,
      telefono: datos.telefono || null,
      alias:    datos.alias && datos.alias.trim() !== '' ? datos.alias.trim().toLowerCase() : null,
      activo:   datos.activo
    }).eq('id', id)
    await cargar()
  }

  async function toggleActivo(id, activo) {
    await supabase.from('perfiles').update({ activo }).eq('id', id)
    await cargar()
  }

  async function actualizarPermiso(rol, modulo, campo, valor) {
    await supabase.from('permisos')
      .update({ [campo]: valor })
      .eq('rol', rol)
      .eq('modulo', modulo)
    await cargar()
  }

  function permisosDeRol(rol) {
    return permisos.filter(p => p.rol === rol)
  }

  const stats = {
    total:    usuarios.length,
    activos:  usuarios.filter(u => u.activo).length,
    inactivos: usuarios.filter(u => !u.activo).length
  }

  return {
    usuarios, permisos, cargando, stats,
    crearUsuario, actualizarPerfil, toggleActivo,
    actualizarPermiso, permisosDeRol, recargar: cargar
  }
}
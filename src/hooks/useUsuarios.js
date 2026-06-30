import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

  async function crearUsuario(cedula, password, datos, credencialesAdmin) {
    const emailTecnico = `bajogrande.${cedula}@gmail.com`

    const { data, error } = await supabase.auth.signUp({
      email: emailTecnico,
      password
    })
    if (error) return { error }

    if (data.user) {
      await supabase.from('perfiles').insert({
        id:       data.user.id,
        nombre:   datos.nombre,
        rol:      datos.rol,
        finca:    datos.finca || null,
        email:    datos.correo_real || null,
        telefono: datos.telefono || null,
        cedula:   cedula,
        activo:   true
      })
    }

    if (credencialesAdmin) {
      await supabase.auth.signInWithPassword({
        email: credencialesAdmin.email,
        password: credencialesAdmin.password
      })
    }

    await cargar()
    return { error: null }
  }

  async function actualizarPerfil(id, datos) {
    await supabase.from('perfiles').update({
      nombre:   datos.nombre,
      rol:      datos.rol,
      finca:    datos.finca || null,
      telefono: datos.telefono || null,
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
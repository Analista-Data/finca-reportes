import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cedula, alias, password, nombre, rol, fincas, telefono, correo_real } = await req.json()

    if (!cedula || !password || !nombre || !rol) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const emailTecnico = `bajogrande.${cedula}@gmail.com`

    // Crear usuario sin enviar ningún correo
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: emailTecnico,
      password: password,
      email_confirm: true
    })

    if (userError) {
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear el perfil asociado
    const { error: perfilError } = await supabaseAdmin.from('perfiles').insert({
      id: userData.user.id,
      nombre,
      rol,
      fincas: fincas && fincas.length > 0 ? fincas : null,
      email: correo_real || null,
      telefono: telefono || null,
      cedula,
      alias: alias && alias.trim() !== '' ? alias.trim().toLowerCase() : null,
      activo: true
    })

    if (perfilError) {
      // Si falla el perfil, eliminamos el usuario para no dejar huérfanos
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: perfilError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, userId: userData.user.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
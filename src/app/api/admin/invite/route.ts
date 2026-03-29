// src/app/api/admin/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // 1. Prüfen ob anfragender Nutzer Admin ist
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  // 2. Request-Body lesen
  const { first_name, last_name, email, role = 'member' } = await req.json()
  if (!first_name || !last_name || !email) {
    return NextResponse.json({ error: 'Vorname, Nachname und E-Mail sind erforderlich.' }, { status: 400 })
  }

  // 3. Admin-Client mit Service Role Key
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 4. Prüfen ob E-Mail bereits existiert
  const { data: existing } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 })
  }

  // 5. Invite senden → Supabase erstellt User + sendet E-Mail
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email.toLowerCase(),
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pistol-pete.vercel.app'}/auth/callback?type=invite` }
  )
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // 6. Profil mit Namen und Rolle befüllen
  const newUserId = inviteData.user.id
  await adminClient.from('profiles').upsert({
    id: newUserId,
    email: email.toLowerCase(),
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    name: `${first_name.trim()} ${last_name.trim()}`,
    role,
  })

  return NextResponse.json({ ok: true })
}

// PATCH — Namen/Rolle eines bestehenden Nutzers aktualisieren
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { id, first_name, last_name, role } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })

  const updates: Record<string, string> = {}
  if (first_name !== undefined) { updates.first_name = first_name.trim(); updates.name = `${first_name.trim()} ${last_name?.trim() ?? ''}`.trim() }
  if (last_name  !== undefined) { updates.last_name  = last_name.trim();  updates.name = `${first_name?.trim() ?? ''} ${last_name.trim()}`.trim() }
  if (role       !== undefined)   updates.role = role

  const { error } = await supabase.from('profiles').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

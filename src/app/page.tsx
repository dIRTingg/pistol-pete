// src/app/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'

export default async function Home() {
  const supabase = await createClient()

  // Auth-User laden
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profil laden (Name + Rolle)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return <AppShell profile={profile} />
}

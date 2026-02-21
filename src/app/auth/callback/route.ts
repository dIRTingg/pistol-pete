// src/app/auth/callback/route.ts
// Supabase leitet nach E-Mail-Klick hierher weiter
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'invite', 'recovery', 'signup'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Nach Invite oder Passwort-Reset → Passwort setzen
      if (type === 'invite' || type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/confirm`)
      }
      // Sonst direkt zur App
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Fehlerfall
  return NextResponse.redirect(`${origin}/login?error=auth`)
}

// src/app/api/notify-admin/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? 'f.haustein@gmx.net'

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })
  }

  let body: { first_name?: string; last_name?: string; email?: string }
  try { body = await req.json() } catch { body = {} }

  const { first_name, last_name, email } = body

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Pistol Pete App <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: '🎾 Neue Registrierungsanfrage – Pistol Pete',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px;">
          <div style="background: #FFE600; padding: 16px 20px; border-bottom: 3px solid #111;">
            <strong style="font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
              🎾 Neue Registrierungsanfrage
            </strong>
          </div>
          <div style="padding: 20px; background: #fff; border: 2px solid #eee;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${first_name ?? '–'} ${last_name ?? '–'}</p>
            <p style="margin: 0 0 8px;"><strong>E-Mail:</strong> ${email ?? '–'}</p>
            <p style="margin: 0 0 20px; color: #888; font-size: 13px;">
              Eingegangen: ${new Date().toLocaleString('de-DE')}
            </p>
            <a href="https://pistol-pete.vercel.app/login"
               style="display: inline-block; background: #FFE600; color: #111; border: 2px solid #111;
                      padding: 10px 20px; font-weight: bold; text-decoration: none; border-radius: 4px;">
              → Zur App (Admin-Bereich)
            </a>
          </div>
          <p style="font-size: 12px; color: #aaa; padding: 12px 20px 0;">
            TV Häslach 1905 e.V. · Pistol Pete App
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Mail failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

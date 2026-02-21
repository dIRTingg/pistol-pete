'use client'
// src/app/auth/confirm/page.tsx
// Wird nach Invite-Link oder "Passwort vergessen" aufgerufen
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const Y = '#FFE600'
const BK = '#111'
const inp: React.CSSProperties = {
  width: '100%', border: `2px solid ${BK}`, borderRadius: 4,
  padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box'
}

export default function ConfirmPage() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const doSet = async () => {
    if (pw.length < 8) { setErr('Passwort muss mindestens 8 Zeichen haben.'); return }
    if (pw !== pw2) { setErr('Passwörter stimmen nicht überein.'); return }
    setLoading(true)
    setErr('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw })

    if (error) {
      setErr('Fehler: ' + error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/'), 2500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Pete Banner */}
          <div style={{ background: Y, border: `3px solid ${BK}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <img src="/icons/pete.png" alt="Pete" style={{ height: 80, width: 'auto' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>Willkommen!</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Bitte vergib jetzt dein persönliches Passwort.</div>
            </div>
          </div>

          {done ? (
            <div style={{ background: '#fff', border: `2px solid #34c759`, borderRadius: 8, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>Passwort gesetzt!</div>
              <div style={{ color: '#555', fontSize: 14 }}>Du wirst automatisch weitergeleitet…</div>
            </div>
          ) : (
            <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
                🔐 Passwort festlegen
              </div>
              <div style={{ padding: 20 }}>
                {err && (
                  <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>
                    {err}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Neues Passwort
                  </label>
                  <input
                    style={inp} type="password" value={pw}
                    onChange={e => setPw(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    autoComplete="new-password"
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Passwort wiederholen
                  </label>
                  <input
                    style={inp} type="password" value={pw2}
                    onChange={e => setPw2(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSet()}
                    placeholder="Nochmals eingeben"
                    autoComplete="new-password"
                  />
                </div>
                <button
                  onClick={doSet}
                  disabled={loading}
                  style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 22px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 16, width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '⏳ Wird gespeichert...' : '✅ Passwort speichern'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

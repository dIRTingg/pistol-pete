'use client'
// src/app/auth/confirm/page.tsx
import { useState, useEffect } from 'react'
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
  const [checking, setChecking] = useState(true)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [userName, setUserName] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // Read hash fragment
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      setDebugInfo(`hash: "${hash.substring(0,40)}..." | type: ${type} | hasToken: ${!!accessToken}`)

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setErr(`Session-Fehler: ${error.message}`)
          setChecking(false)
          return
        }
        // Clear hash
        window.history.replaceState(null, '', '/auth/confirm')
      }

      // Check if we have a user now
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setErr('Kein gültiger Nutzer gefunden. Bitte fordere einen neuen Einladungslink an.')
        setChecking(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles').select('name').eq('id', user.id).single()
      setUserName(profile?.name || user.email || '')
      setChecking(false)
    }

    init()
  }, [])

  const doSet = async () => {
    if (pw.length < 8) { setErr('Passwort muss mindestens 8 Zeichen haben.'); return }
    if (pw !== pw2) { setErr('Passwörter stimmen nicht überein.'); return }
    setLoading(true); setErr('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw })

    if (error) { setErr('Fehler: ' + error.message); setLoading(false) }
    else { setDone(true); setTimeout(() => router.push('/'), 2000) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Debug Info - temporär */}
          {debugInfo && (
            <div style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, padding: 10, marginBottom: 12, fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              🔍 {debugInfo}
            </div>
          )}

          <div style={{ background: Y, border: `3px solid ${BK}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <img src="/icons/pete.png" alt="Pete" style={{ height: 90, width: 'auto' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>
                {checking ? 'Link wird geprüft…' : `Willkommen${userName ? `, ${userName.split(' ')[0]}` : ''}!`}
              </div>
              {!checking && !err && (
                <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>
                  Vergib jetzt dein persönliches Passwort.
                </div>
              )}
            </div>
          </div>

          {checking ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 18 }}>⏳ Wird geladen…</div>
          ) : done ? (
            <div style={{ background: '#fff', border: `2px solid #34c759`, borderRadius: 8, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Passwort gesetzt!</div>
              <div style={{ color: '#555' }}>Du wirst weitergeleitet…</div>
            </div>
          ) : err && !pw ? (
            <div style={{ background: '#fff', border: `2px solid #ff3b30`, borderRadius: 8, padding: 24 }}>
              <div style={{ color: '#ff3b30', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>⚠️ {err}</div>
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 16px' }}>
                Der Einladungslink ist abgelaufen oder ungültig. Bitte wende dich an Florian Haustein für einen neuen Link.
              </p>
              <button onClick={() => router.push('/login')}
                style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                Zum Login
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
                🔐 Passwort festlegen
              </div>
              <div style={{ padding: 20 }}>
                {err && (
                  <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>{err}</div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase' }}>Neues Passwort</label>
                  <input style={inp} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mindestens 8 Zeichen" autoComplete="new-password" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase' }}>Passwort wiederholen</label>
                  <input style={inp} type="password" value={pw2} onChange={e => setPw2(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSet()} placeholder="Nochmals eingeben" autoComplete="new-password" />
                </div>
                {pw.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[3,6,8,12].map((t, i) => (
                        <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: pw.length >= t ? pw.length >= 12 ? '#34c759' : pw.length >= 8 ? '#ff9f0a' : '#ff3b30' : '#eee' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>{pw.length < 8 ? `Noch ${8-pw.length} Zeichen` : pw.length < 12 ? 'OK' : 'Stark ✓'}</div>
                  </div>
                )}
                <button onClick={doSet} disabled={loading}
                  style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '13px 22px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 16, width: '100%', opacity: loading ? 0.7 : 1 }}>
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

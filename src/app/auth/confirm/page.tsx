'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const Y  = '#FFE600'
const BK = '#111'
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }

// ── atoms ────────────────────────────────────────────────────────────────
function BrandBar({ rightLabel = '← Login', onClick }: { rightLabel?: string; onClick?: () => void }) {
  return (
    <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
        <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
      </div>
      <button
        onClick={onClick}
        style={{
          background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 3,
          padding: '4px 9px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {rightLabel}
      </button>
    </div>
  )
}

function PeteHero({ kicker, title, sub, peteHeight = 130, compact = true }: {
  kicker?: string; title: React.ReactNode; sub?: string; peteHeight?: number; compact?: boolean;
}) {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: compact ? 12 : 16,
      position: 'relative', overflow: 'hidden',
      padding: compact ? '14px 16px 0' : '20px 18px 0',
      boxShadow: `4px 4px 0 ${BK}`,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: compact ? 12 : 14 }}>
          {kicker && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{kicker}</div>}
          <div style={{ fontWeight: 900, fontSize: compact ? 28 : 40, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>{sub}</div>}
        </div>
        <img
          src="/icons/pete.png" alt=""
          style={{ height: peteHeight, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, color: '#444' }}>
      {children}
    </label>
  )
}

function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        type={show ? 'text' : 'password'}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: '#fff', color: BK,
          border: `2px solid ${BK}`, borderRadius: 4,
          padding: '12px 78px 12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
        }}
      />
      <button
        type="button" onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, fontWeight: 800, color: BK, letterSpacing: 1.2, textTransform: 'uppercase',
          background: Y, border: `1.5px solid ${BK}`, borderRadius: 3, padding: '3px 7px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
        }}
      >
        <svg width="11" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 4s1.8-3 5-3 5 3 5 3-1.8 3-5 3S1 4 1 4z" stroke={BK} strokeWidth="1.3" />
          <circle cx="6" cy="4" r="1.4" fill={BK} />
        </svg>
        {show ? 'Verb.' : 'Zeigen'}
      </button>
    </div>
  )
}

function PrimaryBtn({ children, color = Y, fg = BK, ...rest }:
  { color?: string; fg?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} style={{
      width: '100%', background: color, color: fg, border: `2px solid ${BK}`,
      borderRadius: 4, padding: '14px 22px', fontWeight: 900, fontSize: 15,
      letterSpacing: 1.5, textTransform: 'uppercase', cursor: rest.disabled ? 'not-allowed' : 'pointer',
      boxShadow: `3px 3px 0 ${BK}`, fontFamily: 'inherit', opacity: rest.disabled ? 0.7 : 1,
      ...rest.style,
    }}>{children}</button>
  )
}

// ── page ─────────────────────────────────────────────────────────────────
export default function ConfirmPage() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setErr(`Session-Fehler: ${error.message}`)
          setChecking(false)
          return
        }
        window.history.replaceState(null, '', '/auth/confirm')
      }

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

  const firstName = userName ? userName.split(' ')[0] : ''

  // ── Wrapper ─────────────────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      <BrandBar onClick={() => router.push('/login')} />
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', flex: 1 }}>
          {children}
        </div>
      </div>
      <div style={{ padding: '14px 16px 18px', textAlign: 'center', fontSize: 10, color: '#777', letterSpacing: 1, textTransform: 'uppercase' }}>
        Impressum · Datenschutz · Nutzungsbedingungen
      </div>
    </div>
  )

  // ── State: checking ────────────────────────────────────────────────────
  if (checking) {
    return (
      <Shell>
        <PeteHero kicker="Wird geprüft" title={<>Link<br />wird geprüft…</>} peteHeight={130} compact />
        <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 14 }}>
          Einen Moment bitte.
        </div>
      </Shell>
    )
  }

  // ── State: error (no user / expired link) ──────────────────────────────
  if (err && !pw && !done) {
    return (
      <Shell>
        <PeteHero kicker="⚠ Link ungültig" title={<>Link<br />abgelaufen</>} peteHeight={130} compact />
        <div style={{
          marginTop: 18, background: '#fff', border: `2px solid #ff3b30`, borderLeft: `5px solid #ff3b30`,
          borderRadius: 4, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#ff3b30', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Hinweis
          </div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{err}</div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PrimaryBtn onClick={() => router.push('/login')}>Zum Login</PrimaryBtn>
          <span style={{ fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 1.5 }}>
            Oder kontaktiere <strong>Florian Haustein</strong> · WhatsApp <span style={mono}>0174 2418407</span>
          </span>
        </div>
      </Shell>
    )
  }

  // ── State: done ────────────────────────────────────────────────────────
  if (done) {
    return (
      <Shell>
        <PeteHero kicker="✓ Passwort gesetzt" title={<>Auf den<br />Platz!</>} sub="Du wirst weitergeleitet…" peteHeight={130} compact />
        <div style={{
          marginTop: 18, background: '#f0fff4', border: `2px solid #34c759`, borderLeft: `5px solid #34c759`,
          borderRadius: 4, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#1e7a3a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Erfolg
          </div>
          <div style={{ fontSize: 13.5, color: '#1e3a25', lineHeight: 1.5 }}>
            Dein Account ist fertig eingerichtet. Du bist jetzt eingeloggt und kannst sofort einchecken.
          </div>
        </div>
      </Shell>
    )
  }

  // ── State: form ────────────────────────────────────────────────────────
  return (
    <Shell>
      <PeteHero
        kicker="● Willkommen"
        title={<>Hallo,<br />{firstName || 'Pete-Crew'}!</>}
        sub="Vergib jetzt dein Passwort"
        peteHeight={130} compact
      />

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Passwort festlegen
        </div>

        {err && (
          <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
            {err}
          </div>
        )}

        <FieldLabel>Neues Passwort</FieldLabel>
        <PasswordInput
          value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Mindestens 8 Zeichen" autoComplete="new-password"
        />
        <div style={{ height: 12 }} />
        <FieldLabel>Passwort wiederholen</FieldLabel>
        <PasswordInput
          value={pw2} onChange={e => setPw2(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSet()}
          placeholder="Nochmals eingeben" autoComplete="new-password"
        />

        {/* Strength meter */}
        {pw.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[3, 6, 8, 12].map((t, i) => (
                <div key={i} style={{
                  flex: 1, height: 5, borderRadius: 3,
                  background: pw.length >= t
                    ? (pw.length >= 12 ? '#34c759' : pw.length >= 8 ? '#ff9f0a' : '#ff3b30')
                    : '#eee',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
              <span>Min. 8 Zeichen</span>
              <span style={{
                color: pw.length < 8 ? '#ff3b30' : pw.length < 12 ? '#ff9f0a' : '#34c759',
                fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>
                {pw.length < 8 ? `Noch ${8 - pw.length} Zeichen` : pw.length < 12 ? `OK · ${pw.length} Zeichen` : `Stark · ${pw.length} Zeichen`}
              </span>
            </div>
          </div>
        )}

        <div style={{ height: pw.length > 0 ? 0 : 16 }} />
        <PrimaryBtn onClick={doSet} disabled={loading}>
          {loading ? 'Wird gespeichert…' : 'Passwort speichern →'}
        </PrimaryBtn>

        <div style={{
          marginTop: 14, background: '#fff', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
          borderRadius: 4, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: BK, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Tipp
          </div>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.4 }}>
            Mind. <strong style={mono}>8 Zeichen</strong>. Eine Mischung aus Buchstaben, Zahlen und Sonderzeichen macht's stärker.
          </div>
        </div>
      </div>
    </Shell>
  )
}

'use client'
// src/app/login/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const Y = '#FFE600'
const BK = '#111'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Don't show if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    if (isStandalone) return

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)

    if (ios) {
      setShowInstall(true)
    } else {
      // Android/Chrome: listen for install prompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowInstall(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const doInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const doLogin = async () => {
    if (!email || !pw) { setErr('Bitte E-Mail und Passwort eingeben.'); return }
    setLoading(true)
    setErr('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) {
      setErr('E-Mail oder Passwort nicht korrekt.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }


  const doReset = async () => {
    if (!email) { setErr('Bitte E-Mail eingeben.'); return }
    setLoading(true)
    setErr('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (error) { setErr('Fehler: ' + error.message) }
    else { setResetSent(true) }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14 }}>Tennis</span>
        </span>
      </div>

      {/* Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Pete Hero */}
          <div style={{ background: Y, border: `3px solid ${BK}`, borderRadius: 12, padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {/* Pete image - lege icons/pete.png in /public/icons/ */}
            <img src="/icons/pete.png" alt="Pistol Pete" style={{ height: 140, width: 'auto', marginBottom: -4, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.25))', imageRendering: 'auto' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div style={{ textAlign: 'left', paddingBottom: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 38, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1, color: BK }}>
                Pistol<br />Pete
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: BK, marginTop: 4, borderTop: `2px solid ${BK}`, paddingTop: 4 }}>
                Ballmaschine<br />TV Häslach
              </div>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
              🔐 Anmelden
            </div>
            <div style={{ padding: 20 }}>
              {err && (
                <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>
                  {err}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>E-Mail</label>
                <input
                  style={{ width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box' as const }}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  placeholder="deine@email.de"
                  autoComplete="email"
                />
              </div>
              {!resetMode && <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Passwort</label>
                <input
                  style={{ width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box' as const }}
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>}
              <button
                onClick={doLogin}
                disabled={loading}
                style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 22px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 16, letterSpacing: 0.5, width: '100%', opacity: loading ? 0.7 : 1, display: resetMode ? 'none' : 'block' }}
              >
                {loading ? 'Wird angemeldet...' : '🔐 Anmelden'}
              </button>
              {!resetMode ? (
                <>
                  <button
                    onClick={() => { setResetMode(true); setErr('') }}
                    style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, marginTop: 12, textDecoration: 'underline', display: 'block', width: '100%', textAlign: 'center' }}
                  >
                    Passwort vergessen?
                  </button>
                  {/* PWA Install Banner */}
          {showInstall && (
            <div style={{ marginTop: 20, background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`, borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  📱 Zum Homescreen hinzufügen
                </div>
                <button onClick={() => setShowInstall(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888', lineHeight: 1, padding: 0 }}>✕</button>
              </div>
              {isIos ? (
                <div style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>
                  <div style={{ marginBottom: 4 }}>So fügst du die App zum Homescreen hinzu:</div>
                  <div>1. Tippe auf <strong>Teilen</strong> <span style={{ fontSize: 16 }}>⎋</span> (unten in Safari)</div>
                  <div>2. Wähle <strong>„Zum Home-Bildschirm"</strong></div>
                  <div>3. Tippe oben rechts auf <strong>„Hinzufügen"</strong></div>
                </div>
              ) : (
                <div style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>
                  <div style={{ marginBottom: 8 }}>Installiere die App direkt auf deinem Homescreen:</div>
                  <button onClick={doInstall}
                    style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, width: '100%' }}>
                    ➕ App installieren
                  </button>
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: '#888', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>
                    Kein Zugang? Wende dich an:<br />
                    <strong>Florian Haustein</strong> · WhatsApp: 01742418407
                  </p>
                </>
              ) : resetSent ? (
                <div style={{ border: '2px solid #34c759', borderLeft: '5px solid #34c759', background: '#f0fff4', borderRadius: 4, padding: '12px 14px', marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>
                  ✅ <strong>Mail gesendet!</strong> Prüfe dein Postfach und klicke den Link.<br />
                  <span style={{ color: '#555', fontSize: 13 }}>📂 Nichts angekommen? Wirf auch einen Blick in deinen <strong>Spam-Ordner</strong> — die Mail kommt von <strong>Supabase Auth</strong>.</span>
                </div>
              ) : (
                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={doReset}
                    disabled={loading}
                    style={{ background: BK, color: Y, border: `2px solid ${BK}`, borderRadius: 4, padding: '11px 22px', cursor: 'pointer', fontWeight: 900, fontSize: 15, width: '100%', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? '⏳...' : '📧 Reset-Mail senden'}
                  </button>
                  <button
                    onClick={() => { setResetMode(false); setErr('') }}
                    style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, marginTop: 8, textDecoration: 'underline', display: 'block', width: '100%', textAlign: 'center' }}
                  >
                    ← Zurück zum Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

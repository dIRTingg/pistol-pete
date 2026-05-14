'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── tokens ───────────────────────────────────────────────────────────────
const Y  = '#FFE600'
const BK = '#111'

// ── atomic components ────────────────────────────────────────────────────
function BrandBar() {
  return (
    <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
        <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>Tennis</span>
    </div>
  )
}

function PeteHero() {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: 16,
      position: 'relative', overflow: 'hidden',
      padding: '20px 18px 0',
      boxShadow: `4px 4px 0 ${BK}`,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Ballmaschine</div>
          <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>
            Pistol<br />Pete
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, display: 'inline-block', background: BK, color: Y, padding: '3px 8px', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase' }}>
            Buchen · Trainieren
          </div>
        </div>
        <img
          src="/icons/pete.png"
          alt=""
          style={{ height: 150, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#fff', color: BK,
        border: `2px solid ${BK}`, borderRadius: 4,
        padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
        ...props.style,
      }}
    />
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
        type="button"
        onClick={() => setShow(s => !s)}
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
    <button
      {...rest}
      style={{
        width: '100%', background: color, color: fg, border: `2px solid ${BK}`,
        borderRadius: 4, padding: '14px 22px', fontWeight: 900, fontSize: 15,
        letterSpacing: 1.5, textTransform: 'uppercase', cursor: rest.disabled ? 'not-allowed' : 'pointer',
        boxShadow: `3px 3px 0 ${BK}`, fontFamily: 'inherit',
        opacity: rest.disabled ? 0.7 : 1,
        ...rest.style,
      }}
    >
      {children}
    </button>
  )
}

// ── page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [installSheet, setInstallSheet] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    if (isStandalone) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)

    if (ios) {
      setShowInstall(true)
    } else {
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
      setInstallSheet(false)
    }
  }

  const doLogin = async () => {
    if (!email || !pw) { setErr('Bitte E-Mail und Passwort eingeben.'); return }
    setLoading(true); setErr('')
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
    setLoading(true); setErr('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (error) setErr('Fehler: ' + error.message)
    else setResetSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column' }}>
      <BrandBar />

      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <PeteHero />

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Anmelden
          </div>

          {err && (
            <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
              {err}
            </div>
          )}

          <FieldLabel>E-Mail</FieldLabel>
          <Input
            type="email" autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (resetMode ? doReset() : doLogin())}
            placeholder="deine@email.de"
          />

          {!resetMode && (
            <>
              <div style={{ height: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <FieldLabel>Passwort</FieldLabel>
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setErr('') }}
                  style={{ background: 'transparent', border: 'none', color: '#666', fontSize: 11, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Vergessen?
                </button>
              </div>
              <PasswordInput
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <div style={{ height: 16 }} />
              <PrimaryBtn onClick={doLogin} disabled={loading}>
                {loading ? 'Wird angemeldet…' : 'Anmelden'}
              </PrimaryBtn>
            </>
          )}

          {resetMode && resetSent && (
            <div style={{ border: '2px solid #34c759', borderLeft: '5px solid #34c759', background: '#f0fff4', borderRadius: 4, padding: '12px 14px', marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>
              ✅ <strong>Mail gesendet!</strong> Prüfe dein Postfach und klicke den Link.<br />
              <span style={{ color: '#555', fontSize: 13 }}>
                📂 Nichts angekommen? Wirf auch einen Blick in deinen <strong>Spam-Ordner</strong> — die Mail kommt von <strong>Supabase Auth</strong>.
              </span>
            </div>
          )}

          {resetMode && !resetSent && (
            <div style={{ marginTop: 14 }}>
              <PrimaryBtn color={BK} fg={Y} onClick={doReset} disabled={loading}>
                {loading ? '…' : 'Reset-Mail senden'}
              </PrimaryBtn>
              <button
                onClick={() => { setResetMode(false); setErr('') }}
                style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: 12, marginTop: 10, textDecoration: 'underline', display: 'block', width: '100%', textAlign: 'center', fontFamily: 'inherit' }}
              >
                ← Zurück zum Login
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0 8px' }}>
          <span style={{ fontSize: 13, color: '#666' }}>Noch kein Zugang? </span>
          <a
            href="/mitmachen"
            style={{ fontSize: 13, color: BK, fontWeight: 800, textDecoration: 'none', borderBottom: `2px solid ${Y}` }}
          >
            Mitmachen →
          </a>
        </div>
      </div>

      {showInstall && !installSheet && (
        <div
          onClick={() => setInstallSheet(true)}
          style={{ background: BK, color: Y, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `3px solid ${Y}`, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>📱 App auf Homescreen speichern</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: Y, textTransform: 'uppercase', borderBottom: `2px solid ${Y}` }}>
            Anleitung
          </span>
        </div>
      )}

      {showInstall && installSheet && (
        <div style={{ background: BK, color: Y, padding: '14px 16px 16px', borderTop: `3px solid ${Y}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              📱 Zum Homescreen hinzufügen
            </div>
            <button
              onClick={() => setInstallSheet(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: Y, lineHeight: 1, padding: 0, fontFamily: 'inherit' }}
            >✕</button>
          </div>
          {isIos ? (
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              <div>1. Tippe auf <strong>Teilen</strong> ⎋ (unten in Safari)</div>
              <div>2. Wähle <strong>„Zum Home-Bildschirm"</strong></div>
              <div>3. Tippe oben rechts auf <strong>„Hinzufügen"</strong></div>
            </div>
          ) : (
            <button
              onClick={doInstall}
              style={{ background: Y, color: BK, border: `2px solid ${Y}`, borderRadius: 4, padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: 13, width: '100%', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 }}
            >
              ➕ App installieren
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '14px 16px 18px', textAlign: 'center', fontSize: 10, color: '#777', letterSpacing: 1, textTransform: 'uppercase' }}>
        <a href="/impressum" style={{ color: '#777', textDecoration: 'none' }}>Impressum · Datenschutz</a>
        {' · '}
        <a href="/nutzungsbedingungen" style={{ color: '#777', textDecoration: 'none' }}>Nutzungsbedingungen</a>
      </div>
    </div>
  )
}

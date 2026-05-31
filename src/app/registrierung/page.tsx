'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const Y  = '#FFE600'
const BK = '#111'

// ── atoms ────────────────────────────────────────────────────────────────
function BrandBar({ rightHref, rightLabel }: { rightHref?: string; rightLabel?: string }) {
  return (
    <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
        <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
      </div>
      {rightHref && (
        <a href={rightHref} style={{ fontSize: 11, fontWeight: 800, color: BK, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', borderBottom: `2px solid ${Y}` }}>
          {rightLabel}
        </a>
      )}
    </div>
  )
}

function PeteHero({ kicker, title, sub, peteHeight = 140, compact = false }: {
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
          {sub && (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, display: 'inline-block', background: BK, color: Y, padding: '3px 8px', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase' }}>{sub}</div>
          )}
        </div>
        <img src="/icons/pete.png" alt="" style={{ height: peteHeight, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }} />
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
    <input {...props} style={{
      width: '100%', boxSizing: 'border-box',
      background: '#fff', color: BK,
      border: `2px solid ${BK}`, borderRadius: 4,
      padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
      ...props.style,
    }} />
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

function ConsentRow({ checked, onChange, children }:
  { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 10 }}>
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <div style={{
        width: 22, height: 22, flexShrink: 0, marginTop: 1,
        background: checked ? Y : '#fff', border: `2px solid ${BK}`,
        borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
            <path d="M1 4.5l3.2 3L11 1" stroke={BK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, lineHeight: 1.45, color: '#333' }}>{children}</span>
    </label>
  )
}

// ── page ─────────────────────────────────────────────────────────────────
export default function Registrierung() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [terms, setTerms]         = useState(false)
  const [billing, setBilling]     = useState(false)
  const [privacy, setPrivacy]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [err, setErr]             = useState('')

  const doSubmit = async () => {
    setErr('')
    if (!firstName.trim() || !lastName.trim() || !email.trim()) { setErr('Bitte alle Felder ausfüllen.'); return }
    if (!email.includes('@')) { setErr('Bitte eine gültige E-Mail-Adresse eingeben.'); return }
    if (!terms || !billing || !privacy) { setErr('Bitte alle Zustimmungen bestätigen.'); return }

    setLoading(true)
    const supabase = createClient()

    const { data: emailStatus } = await supabase.rpc('check_email_available', {
      p_email: email.trim().toLowerCase(),
    })

    if (emailStatus === 'registered') {
      setErr('Diese E-Mail-Adresse ist bereits registriert. Du kannst dich direkt einloggen.')
      setLoading(false); return
    }
    if (emailStatus === 'pending') {
      setErr('Für diese E-Mail-Adresse liegt bereits eine Registrierungsanfrage vor. Bitte hab noch etwas Geduld — die Freigabe kann bis zu 24 Stunden dauern.')
      setLoading(false); return
    }
    if (emailStatus === 'invited') {
      setErr('Diese E-Mail-Adresse wurde bereits eingeladen. Bitte prüfe dein Postfach (auch Spam) und richte dein Passwort ein.')
      setLoading(false); return
    }

    const { error } = await supabase.from('registration_requests').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      accepted_terms: true,
      accepted_billing: true,
      accepted_privacy: true,
    })
    if (!error) {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() }),
      }).catch(() => {})
    }
    setLoading(false)
    if (error) setErr('Ein Fehler ist aufgetreten. Bitte versuche es erneut oder wende dich an den Ballmaschinenwart.')
    else setDone(true)
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>
        <BrandBar rightHref="/login" rightLabel="Login →" />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 18px' }}>
          <PeteHero kicker="● Eingegangen" title={<>Danke,<br />{firstName}!</>} peteHeight={130} compact />

          <div style={{ marginTop: 18, fontSize: 14, color: '#333', lineHeight: 1.55 }}>
            <p style={{ margin: '0 0 12px' }}>
              Deine Registrierungsanfrage wurde erfolgreich übermittelt.
            </p>
            <p style={{ margin: 0, color: '#555' }}>
              Der Ballmaschinenwart prüft deine Anfrage und schaltet deinen Zugang frei. Du erhältst anschließend eine E-Mail zur Einrichtung deines persönlichen Passworts.
            </p>
          </div>

          <div style={{
            marginTop: 16, background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
            borderRadius: 4, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: BK, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              ⏱ Bitte etwas Geduld
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>
              Die Freigabe erfolgt manuell und kann bis zu <strong>
                <span style={{ fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }}>24 h</span>
              </strong> dauern. Schau auch in deinen <strong>Spam-Ordner</strong> (Absender: Supabase Auth).
            </div>
          </div>

          <p style={{ margin: '16px 0 0', fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 1.5 }}>
            Fragen? <strong>Florian Haustein</strong> · WhatsApp 0174 2418407
          </p>
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/mitmachen" style={{ fontSize: 13, color: BK, fontWeight: 800, textDecoration: 'none', borderBottom: `2px solid ${Y}` }}>
              ← Zurück zur Übersicht
            </a>
          </p>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>
      <BrandBar rightHref="/login" rightLabel="← Login" />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 18px 32px' }}>
        <PeteHero kicker="Mitmachen" title={<>Werde Teil<br />der Pete-Crew</>} sub="60 Sekunden" peteHeight={120} compact />

        <div style={{
          marginTop: 16, background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
          borderRadius: 4, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: BK, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
            Hinweis · Freigabe
          </div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>
            Manuelle Freigabe durch den Admin · bis zu <strong>
              <span style={{ fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }}>24 h</span>
            </strong>. Du wirst per E-Mail benachrichtigt.
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Anmeldung
          </div>

          {err && (
            <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
              {err}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <FieldLabel>Vorname</FieldLabel>
              <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Max" autoComplete="given-name" />
            </div>
            <div>
              <FieldLabel>Nachname</FieldLabel>
              <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mustermann" autoComplete="family-name" />
            </div>
          </div>
          <FieldLabel>E-Mail</FieldLabel>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" autoComplete="email" />

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `2px solid #eee` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Zustimmungen · alle erforderlich
            </div>
            <ConsentRow checked={terms} onChange={setTerms}>
              Ich habe die <a href="/nutzungsbedingungen" target="_blank" style={{ color: BK, fontWeight: 800, borderBottom: `2px solid ${Y}`, textDecoration: 'none' }}>Nutzungsbedingungen</a> gelesen und akzeptiere sie.
            </ConsentRow>
            <ConsentRow checked={billing} onChange={setBilling}>
              Ich stimme der Abrechnung von <strong>
                <span style={{ fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }}>5,00 €</span>
              </strong> pro angefangener Stunde zu.
            </ConsentRow>
            <ConsentRow checked={privacy} onChange={setPrivacy}>
              Ich stimme der Speicherung meiner Daten (Vorname, Nachname, E-Mail) zur Nutzerverwaltung und Abrechnung innerhalb des TV Häslach 1905 e.V. zu.
            </ConsentRow>
          </div>

          <div style={{ marginTop: 16 }}>
            <PrimaryBtn onClick={doSubmit} disabled={loading}>
              {loading ? 'Wird gesendet…' : 'Anmeldung senden →'}
            </PrimaryBtn>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#777', letterSpacing: 1, textTransform: 'uppercase' }}>
          <a href="/mitmachen" style={{ color: '#777', textDecoration: 'none' }}>← Zurück</a>
          {' · '}
          <a href="/nutzungsbedingungen" style={{ color: '#777', textDecoration: 'none' }}>Nutzungsbedingungen</a>
          {' · '}
          <a href="/impressum" style={{ color: '#777', textDecoration: 'none' }}>Impressum</a>
        </p>
      </div>
    </div>
  )
}

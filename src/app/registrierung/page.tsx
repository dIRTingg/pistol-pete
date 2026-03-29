'use client'
// src/app/registrierung/page.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const Y = '#FFE600'; const BK = '#111'
const inp: React.CSSProperties = { width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }

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

    // Prüfen ob E-Mail bereits registriert oder Anfrage vorhanden
    const [{ data: existingProfile }, { data: existingRequest }] = await Promise.all([
      supabase.from('profiles').select('id').eq('email', email.trim().toLowerCase()).maybeSingle(),
      supabase.from('registration_requests').select('id', 'status').eq('email', email.trim().toLowerCase()).maybeSingle(),
    ])

    if (existingProfile) {
      setErr('Diese E-Mail-Adresse ist bereits registriert. Du kannst dich direkt einloggen.')
      setLoading(false)
      return
    }
    if (existingRequest) {
      setErr('Für diese E-Mail-Adresse liegt bereits eine Registrierungsanfrage vor. Bitte hab noch etwas Geduld — die Freigabe kann bis zu 24 Stunden dauern.')
      setLoading(false)
      return
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
      // E-Mail-Benachrichtigung an Admin
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() }),
      }).catch(() => {}) // Fehler hier nicht blockieren
    }
    setLoading(false)
    if (error) {
      setErr('Ein Fehler ist aufgetreten. Bitte versuche es erneut oder wende dich an den Ballmaschinenwart.')
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', display: 'flex', alignItems: 'center', height: 64 }}>
        <div style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </div>
      </div>
      <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ background: '#fff', border: `2px solid #34c759`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: '#34c759', borderBottom: `2px solid ${BK}`, padding: '14px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
            ✅ Anfrage eingegangen!
          </div>
          <div style={{ padding: 24, lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
              Danke, {firstName}! Deine Registrierungsanfrage wurde erfolgreich übermittelt.
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#555' }}>
              Der Ballmaschinenwart prüft deine Anfrage und schaltet deinen Zugang frei.
              Du erhältst anschließend eine E-Mail zur Einrichtung deines persönlichen Passworts.
            </p>
            <div style={{ background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`, borderRadius: 6, padding: '12px 16px', fontSize: 14 }}>
              ⏱️ <strong>Bitte etwas Geduld:</strong> Die Freigabe erfolgt manuell und kann bis zu <strong>24 Stunden</strong> in Anspruch nehmen.
              Schau auch in deinen <strong>Spam-Ordner</strong> (Absender: Supabase Auth).
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 13, color: '#888' }}>
              Fragen? Wende dich an <strong>Florian Haustein</strong> · WhatsApp: 01742418407
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/mitmachen" style={{ color: BK, fontSize: 14 }}>← Zurück zur Übersicht</a>
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', display: 'flex', alignItems: 'center', height: 64 }}>
        <div style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </div>
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Hinweis Freigabe */}
        <div style={{ background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`, borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
          ⏱️ <strong>Hinweis:</strong> Die Freigabe deines Zugangs erfolgt manuell durch den Admin und kann bis zu <strong>24 Stunden</strong> dauern. Du wirst per E-Mail benachrichtigt.
        </div>

        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '14px 20px', fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
            🎾 Für Ballmaschine anmelden
          </div>
          <div style={{ padding: 20 }}>

            {err && <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>{err}</div>}

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div><label style={lbl}>Vorname</label><input style={inp} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Max" autoComplete="given-name" /></div>
              <div><label style={lbl}>Nachname</label><input style={inp} type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mustermann" autoComplete="family-name" /></div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>E-Mail</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" autoComplete="email" />
            </div>

            {/* Checkboxen */}
            <div style={{ borderTop: `2px solid #eee`, paddingTop: 16, marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>Zustimmungen (alle erforderlich)</p>
              {[
                { state: terms,   set: setTerms,   label: <>Ich habe die <a href="/nutzungsbedingungen" target="_blank" style={{ color: BK, fontWeight: 700 }}>Nutzungsbedingungen</a> gelesen und akzeptiere sie.</> },
                { state: billing, set: setBilling, label: <>Ich stimme der Abrechnung von <strong>5,00 € pro angefangener Stunde</strong> zu.</> },
                { state: privacy, set: setPrivacy, label: <>Ich stimme der Speicherung meiner Daten (Vorname, Nachname, E-Mail) zur Nutzerverwaltung und Abrechnung innerhalb des TV Häslach 1905 e.V. zu.</> },
              ].map(({ state, set, label }, i) => (
                <label key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer', fontSize: 14, lineHeight: 1.5 }}>
                  <input
                    type="checkbox" checked={state} onChange={e => set(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: BK, cursor: 'pointer' }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={doSubmit} disabled={loading}
              style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 22px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 16, width: '100%', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
            >
              {loading ? '⏳ Wird gesendet...' : '✅ Jetzt anmelden'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>
          <a href="/mitmachen" style={{ color: '#888' }}>← Zurück</a>
          {' · '}
          <a href="/nutzungsbedingungen" style={{ color: '#888' }}>Nutzungsbedingungen</a>
          {' · '}
          <a href="/impressum" style={{ color: '#888' }}>Impressum</a>
        </p>
      </div>
    </div>
  )
}

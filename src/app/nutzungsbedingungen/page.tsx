// src/app/nutzungsbedingungen/page.tsx  — server component (no 'use client')

const Y  = '#FFE600'
const BK = '#111'
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }

// ── atoms ────────────────────────────────────────────────────────────────
function BrandBar() {
  return (
    <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
        <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
      </div>
      <a
        href="/mitmachen"
        style={{
          background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 3,
          padding: '4px 9px', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        ← Zurück
      </a>
    </div>
  )
}

function NumBadge({ n }: { n: string }) {
  return (
    <div style={{
      ...mono,
      fontWeight: 900, fontSize: 11, color: BK,
      background: Y, border: `2px solid ${BK}`, borderRadius: 4,
      padding: '2px 8px', display: 'inline-block', marginBottom: 8,
      letterSpacing: 1,
    }}>
      {n}
    </div>
  )
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <NumBadge n={num} />
      <div style={{
        fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1,
        color: BK, marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────
export default function NutzungsbedingungenPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f4f4ef',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      color: BK,
    }}>
      <BrandBar />

      <div style={{ flex: 1, padding: '0 18px' }}>
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>

          {/* ── Hero ────────────────────────────────────────────────── */}
          <div style={{
            background: Y, border: `3px solid ${BK}`, borderRadius: 12,
            position: 'relative', overflow: 'hidden',
            padding: '14px 16px 0',
            boxShadow: `4px 4px 0 ${BK}`, marginBottom: 18,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, paddingBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Pistol Pete</div>
                <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>Nutzungs-<br />bedingungen</div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>TV Häslach 1905 e.V.</div>
              </div>
              <img
                src="/icons/pete.png" alt=""
                style={{ height: 130, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
              />
            </div>
          </div>

          {/* ── TL;DR ───────────────────────────────────────────────── */}
          <div style={{
            background: BK, border: `2px solid ${BK}`, borderRadius: 6,
            padding: '12px 14px', marginBottom: 18,
            boxShadow: `3px 3px 0 ${Y}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: Y, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>TL;DR</div>
            <div style={{ fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>
              Nur Mitglieder · Einweisung erforderlich · 5 € / angef. Std. · Sicherheitsregeln einhalten · Schloss wieder anbringen.
            </div>
          </div>

          {/* ── Sections ────────────────────────────────────────────── */}
          <div style={{
            background: '#fff', border: `2px solid ${BK}`,
            borderRadius: 6, padding: '16px 14px', marginBottom: 18,
          }}>
            <Section num="01" title="Nutzungsvoraussetzungen">
              Die Nutzung der Ballmaschine „Pistol Pete" (Lobster Elite Two) ist ausschließlich Mitgliedern des TV Häslach 1905 e.V. gestattet. Eine Nutzung ist erst nach einer persönlichen Einweisung durch den Ballmaschinenwart zulässig. Mitglieder unter 18 Jahren benötigen das Einverständnis eines Erziehungsberechtigten.
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="02" title="Anmeldung & Freigabe">
              Die Registrierung erfolgt über das Anmeldeformular. Jede Registrierung wird manuell durch den Admin geprüft und freigegeben. Nach Freigabe erhält das Mitglied eine E-Mail zur Passwort-Einrichtung. Es besteht kein Anspruch auf sofortige Freigabe.
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="03" title="Abrechnung">
              <span>Die Nutzung ist kostenpflichtig: </span>
              <span style={{
                background: Y, border: `1.5px solid ${BK}`, borderRadius: 3,
                padding: '2px 7px', fontWeight: 900, fontSize: 13, ...mono,
                display: 'inline-block', margin: '0 2px',
              }}>5,00 €</span>
              <span> pro angefangene Stunde. Die Erfassung erfolgt digital über die Pistol Pete App. Die Abrechnung erfolgt über den Verein.</span>
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="04" title="Sicherheit & Sorgfaltspflichten">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Niemals in die laufende Maschine fassen — Verletzungsgefahr!',
                  'Bei Regen oder Nässe nicht verwenden.',
                  'Ausschließlich vorgesehene drucklose Bälle verwenden.',
                  'Maschine vorsichtig transportieren. Bei Stufen tragen.',
                  'Nach der Nutzung das Kettenschloss wieder anbringen.',
                  'Schäden sofort dem Ballmaschinenwart melden.',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#333', lineHeight: 1.35 }}>
                    <span style={{ color: BK, fontWeight: 900 }}>›</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="05" title="Haftung">
              Die Nutzung erfolgt auf eigene Gefahr. Der TV Häslach 1905 e.V. übernimmt keine Haftung für Schäden durch unsachgemäße Handhabung oder Nichtbeachtung der Sicherheitshinweise. Für Schäden an der Maschine durch grobe Fahrlässigkeit haftet der Nutzer.
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="06" title="Datenschutz">
              Es werden Vorname, Nachname, E-Mail sowie Nutzungsdaten (Datum, Dauer, Kosten) gespeichert. Diese dienen ausschließlich der Nutzerverwaltung und Abrechnung. Keine Weitergabe an Dritte. Details:{' '}
              <a href="/impressum" style={{ color: BK, fontWeight: 700 }}>Impressum & Datenschutz</a>.
            </Section>

            <div style={{ borderTop: `1px solid #eee`, marginBottom: 18 }} />

            <Section num="07" title="Änderungen">
              Der TV Häslach 1905 e.V. behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Registrierte Nutzer werden über wesentliche Änderungen per E-Mail informiert.
            </Section>
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div style={{
            borderTop: `2px dashed #ccc`, paddingTop: 14,
            fontSize: 10, color: '#888', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Stand · Februar 2026 · TV Häslach 1905 e.V.
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 12 }}>
              <a href="/impressum" style={{ color: '#888', textDecoration: 'none' }}>Impressum & Datenschutz</a>
              <span>·</span>
              <a href="/mitmachen" style={{ color: '#888', textDecoration: 'none' }}>Mitmachen</a>
            </div>
          </div>

        </div>
      </div>

      <div style={{ padding: '14px 16px 18px', textAlign: 'center', fontSize: 10, color: '#777', letterSpacing: 1, textTransform: 'uppercase' }}>
        Impressum · Datenschutz · Nutzungsbedingungen
      </div>
    </div>
  )
}

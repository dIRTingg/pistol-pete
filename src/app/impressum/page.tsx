'use client'

import { useRouter } from 'next/navigation'

const Y  = '#FFE600'
const BK = '#111'
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }

// ── atoms ────────────────────────────────────────────────────────────────
function BrandBar({ onClick }: { onClick?: () => void }) {
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
        ← Zurück
      </button>
    </div>
  )
}

function PeteHero({ kicker, title, sub }: { kicker?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: 12,
      position: 'relative', overflow: 'hidden',
      padding: '14px 16px 0',
      boxShadow: `4px 4px 0 ${BK}`, marginBottom: 18,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: 12 }}>
          {kicker && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{kicker}</div>}
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>{sub}</div>}
        </div>
        <img
          src="/icons/pete.png" alt=""
          style={{ height: 130, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5,
      color: BK, borderBottom: `2px solid ${BK}`, paddingBottom: 6, marginBottom: 10,
      margin: '0 0 10px',
    }}>
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13.5, color: '#333', lineHeight: 1.6, margin: '0 0 14px' }}>
      {children}
    </p>
  )
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#333', marginBottom: 5, lineHeight: 1.4 }}>
          <span style={{ color: BK, fontWeight: 900, flexShrink: 0 }}>›</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: '#fff', border: `2px solid ${BK}`,
      borderLeft: `5px solid ${accent ?? Y}`,
      borderRadius: 4, padding: '12px 14px', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────
export default function ImpressumPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      <BrandBar onClick={() => router.back()} />

      <div style={{ flex: 1, padding: '0 18px' }}>
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>

          <PeteHero
            kicker="Rechtliches"
            title={<>Impressum &amp;<br />Datenschutz</>}
            sub="TV Häslach 1905 e.V. · Pistol Pete"
          />

          {/* ── A · Impressum ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Impressum</SectionHeading>
            <P>
              <strong>TV Häslach 1905 e.V.</strong><br />
              Abteilung Tennis<br />
              Interne Vereinsanwendung – nicht öffentlich zugänglich.
            </P>

            {/* FH-Karte */}
            <div style={{
              background: BK, border: `2px solid ${BK}`, borderRadius: 6,
              padding: '12px 14px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: Y, border: `2px solid #333`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16, color: BK, flexShrink: 0,
              }}>FH</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: 0.5 }}>Florian Haustein</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Ballmaschinenwart · techn. Betreiber</div>
              </div>
            </div>

            {/* Kontakt-Karte */}
            <div style={{
              background: Y, border: `2px solid ${BK}`, borderRadius: 6,
              padding: '10px 14px', boxShadow: `3px 3px 0 ${BK}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>WhatsApp</div>
              <div style={{ ...mono, fontWeight: 900, fontSize: 15 }}>0174 2418407</div>
            </div>
          </div>

          {/* ── B · Datenschutz ───────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Datenschutzerklärung</SectionHeading>
            <P>
              Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Erklärung informiert dich über Erhebung, Verwendung und Speicherung deiner Daten.
            </P>
          </div>

          {/* ── C · Welche Daten ──────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Welche Daten werden gespeichert?</SectionHeading>
            <UL items={[
              <><strong>Account:</strong> Name und E-Mail (durch Admin angelegt)</>,
              <><strong>Nutzung:</strong> Datum, Uhrzeit, Dauer und Kosten jeder Session</>,
              <><strong>Korrekturen:</strong> Anpassungen inkl. Begründung</>,
              <><strong>Technisch:</strong> Supabase &amp; Vercel loggen anonymisierte Zugriffsdaten (IP, Zeitstempel)</>,
            ]} />
          </div>

          {/* ── D · Wofür ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Wofür werden die Daten genutzt?</SectionHeading>
            <UL items={[
              'Abrechnung der Ballmaschinennutzung (5 € / angefangene Stunde)',
              'Verwaltung und Nachverfolgung der Buchungen',
              'Abrechnungsübersichten für den Verein',
            ]} />
            <P>Kein Tracking. Keine Weitergabe an Dritte. Keine Werbung.</P>
          </div>

          {/* ── Provider-Karten ───────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Wo werden die Daten gespeichert?</SectionHeading>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Supabase</div>
              <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>
                Datenbank &amp; Authentifizierung<br />
                Serverstandort: <strong>Frankfurt, DE</strong> (DSGVO-konform)<br />
                <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={{ color: BK, ...mono, fontSize: 11 }}>supabase.com/privacy</a>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Vercel</div>
              <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>
                Hosting der Webanwendung<br />
                Serverstandort: Washington D.C., USA (EU-Garantien)<br />
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={{ color: BK, ...mono, fontSize: 11 }}>vercel.com/legal/privacy-policy</a>
              </div>
            </Card>
          </div>

          {/* ── E · DSGVO-Rechte ──────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Deine Rechte (DSGVO)</SectionHeading>
            <UL items={[
              <><strong>Auskunft:</strong> Du kannst jederzeit Auskunft über gespeicherte Daten verlangen</>,
              <><strong>Berichtigung:</strong> Fehlerhafte Daten werden auf Anfrage korrigiert</>,
              <><strong>Löschung:</strong> Du kannst die Löschung deines Accounts beantragen</>,
              <><strong>Widerspruch:</strong> Du kannst der Verarbeitung widersprechen</>,
            ]} />
            <Card accent="#34c759">
              <div style={{ fontSize: 11, fontWeight: 900, color: '#1e7a3a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Kontakt</div>
              <div style={{ fontSize: 12.5, color: '#1e3a25', lineHeight: 1.5 }}>
                <strong>Florian Haustein</strong> · WhatsApp <span style={mono}>0174 2418407</span>
              </div>
            </Card>
          </div>

          {/* ── F · Cookies ───────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeading>Cookies &amp; lokale Speicherung</SectionHeading>
            <P>
              Ausschließlich technisch notwendige Cookies zur Aufrechterhaltung der Anmeldesitzung (Session-Cookie von Supabase). Kein Tracking. Keine Analyse-Dienste.
            </P>
          </div>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <div style={{
            borderTop: `2px dashed #ccc`, paddingTop: 14, marginTop: 4,
            fontSize: 10, color: '#888', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Stand · Februar 2026 · TV Häslach 1905 e.V.
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 12 }}>
              <a href="/nutzungsbedingungen" style={{ color: '#888', textDecoration: 'none' }}>Nutzungsbedingungen</a>
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

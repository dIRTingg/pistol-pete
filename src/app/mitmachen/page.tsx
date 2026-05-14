import Link from 'next/link'

const Y  = '#FFE600'
const BK = '#111'

function StepRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        background: Y, border: `2px solid ${BK}`, borderRadius: 4,
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 16, flexShrink: 0,
        fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: -0.5,
      }}>{n}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: '#555', lineHeight: 1.45, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}

function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {kicker && <div style={{ fontSize: 11, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: 2 }}>{kicker}</div>}
      <div style={{ fontSize: 24, fontWeight: 900, color: BK, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, marginTop: 2 }}>{title}</div>
    </div>
  )
}

export default function MitmachenPage() {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>

      {/* ── BrandBar ── */}
      <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
          <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
        </div>
        <Link href="/login" style={{ fontSize: 11, fontWeight: 800, color: BK, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', borderBottom: `2px solid ${Y}` }}>
          Login →
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 18px' }}>

        {/* ── Pete-Hero ── */}
        <div style={{
          background: Y, border: `3px solid ${BK}`, borderRadius: 16,
          position: 'relative', overflow: 'hidden', boxShadow: `4px 4px 0 ${BK}`,
          padding: '20px 18px 0',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,0.05) 22px 23px)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Mitmachen</div>
              <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 1.5, lineHeight: 0.92, textTransform: 'uppercase' }}>
                Trainiere<br />wie ein<br /><span style={{ background: BK, color: Y, padding: '0 8px' }}>Profi</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 10, lineHeight: 1.4 }}>
                Die Ballmaschine „Pistol Pete" — für alle Mitglieder des TV Häslach 1905.
              </div>
            </div>
            <img
              src="/icons/pete.png"
              alt="Pistol Pete"
              style={{ height: 200, marginRight: -14, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.18))', flexShrink: 0 }}
            />
          </div>
          <Link
            href="/registrierung"
            style={{
              display: 'block', textAlign: 'center', margin: '0 -18px 0', padding: '14px 16px',
              background: BK, color: Y, fontWeight: 900, fontSize: 15, letterSpacing: 2,
              textTransform: 'uppercase', borderTop: `3px solid ${BK}`, textDecoration: 'none',
            }}
          >
            Jetzt anmelden →
          </Link>
        </div>

        {/* ── Was ist Pistol Pete? ── */}
        <div style={{ marginTop: 22 }}>
          <SectionTitle kicker="Was ist das?" title="Pistol Pete" />
          <p style={{ margin: '0 0 8px', fontSize: 13.5, lineHeight: 1.55, color: '#333' }}>
            Unsere <strong>Lobster Elite Two</strong> — eine professionelle Ballmaschine, die dir Bälle in einstellbarer Geschwindigkeit, Höhe und mit Topspin oder Slice zuspielt.
          </p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: '#333' }}>
            Perfekt für gezieltes Training — Schlagtechnik und Konstanz verbessern, alleine oder in der Gruppe.
          </p>
        </div>

        {/* ── So einfach geht's ── */}
        <div style={{ marginTop: 22 }}>
          <SectionTitle kicker="In drei Schritten" title="So einfach geht's" />
          <StepRow n="01" title="Anmelden & Einweisung" desc="Formular ausfüllen, Nutzungsbedingungen akzeptieren. Bei Bedarf Einweisung beim Ballmaschinenwart." />
          <StepRow n="02" title="App öffnen & einchecken" desc="Datum und Dauer eingeben, einchecken. Der Schloss-Code erscheint automatisch." />
          <StepRow n="03" title="Loslegen" desc="Maschine ausrichten, Bälle einfüllen, Training starten. Nach Nutzung Schloss anbringen." />
        </div>

        {/* ── Kosten · Scoreboard ── */}
        <div style={{
          marginTop: 18, background: BK, border: `2px solid ${BK}`, borderRadius: 8,
          padding: '20px 18px', textAlign: 'center', boxShadow: `4px 4px 0 ${Y}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 2 }}>
            Die Kosten · transparent
          </div>
          <div style={{
            fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
            fontSize: 64, fontWeight: 900, color: Y, lineHeight: 1, letterSpacing: -2, marginTop: 2,
          }}>5 €</div>
          <div style={{ fontSize: 13, color: '#fff', marginTop: 4, fontWeight: 700 }}>pro angefangene Stunde</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>Digital abgerechnet · keine versteckten Kosten</div>
        </div>

        {/* ── Schnellanleitung · PDF ── */}
        <div style={{ marginTop: 18 }}>
          <div style={{ background: '#fff', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`, borderRadius: 4, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: 1.5 }}>PDF · 2 Seiten</div>
                <div style={{ fontWeight: 900, fontSize: 16, marginTop: 2 }}>Schnellanleitung</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Bedienung kompakt — gerne schon vorab.</div>
              </div>
              <a
                href="/Schnellanleitung_Ballmaschine.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4,
                  padding: '10px 16px', fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                Öffnen →
              </a>
            </div>
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div style={{
          marginTop: 22, background: Y, border: `2px solid ${BK}`, borderRadius: 8,
          padding: '20px 18px', textAlign: 'center', boxShadow: `3px 3px 0 ${BK}`,
        }}>
          <div style={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>Bereit?</div>
          <p style={{ margin: '6px 0 14px', fontSize: 13, color: '#444', lineHeight: 1.45 }}>
            Nach Admin-Freigabe sofort startklar.
          </p>
          <Link
            href="/registrierung"
            style={{
              display: 'block', background: BK, color: Y, border: `2px solid ${BK}`, borderRadius: 4,
              padding: '14px 22px', fontWeight: 900, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase',
              textDecoration: 'none', boxShadow: `3px 3px 0 ${BK}`,
            }}
          >
            Jetzt anmelden →
          </Link>
          <div style={{ fontSize: 11, color: '#444', marginTop: 12 }}>
            Fragen? <strong>Florian Haustein</strong> · WhatsApp 0174 2418407
          </div>
        </div>

        {/* ── Legal footer ── */}
        <div style={{ padding: '22px 0 24px', textAlign: 'center', fontSize: 10, color: '#777', letterSpacing: 1, textTransform: 'uppercase' }}>
          <a href="/nutzungsbedingungen" style={{ color: '#777', textDecoration: 'none' }}>Nutzungsbedingungen</a>
          {' · '}
          <a href="/impressum" style={{ color: '#777', textDecoration: 'none' }}>Impressum & Datenschutz</a>
        </div>
      </div>
    </div>
  )
}

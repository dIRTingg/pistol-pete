// src/app/mitmachen/page.tsx
export default function Mitmachen() {
  const Y = '#FFE600'; const BK = '#111'

  const Step = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>{num}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>

      {/* Header */}
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', display: 'flex', alignItems: 'center', height: 64 }}>
        <div style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: BK, color: '#fff', padding: '48px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,230,0,0.03) 40px, rgba(255,230,0,0.03) 80px)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <img src="/icons/pete.png" alt="Pistol Pete" style={{ height: 140, width: 'auto', marginBottom: 16, filter: 'drop-shadow(0 4px 16px rgba(255,230,0,0.3))' }} />
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.1 }}>
            Trainiere wie<br /><span style={{ color: Y }}>ein Profi</span>
          </h1>
          <p style={{ fontSize: 18, color: '#aaa', margin: '0 0 28px', fontWeight: 400 }}>
            Die Ballmaschine „Pistol Pete" — für alle Mitglieder des TV Häslach 1905 e.V.
          </p>
          <a href="/registrierung" style={{ display: 'inline-block', background: Y, color: BK, border: `2px solid ${Y}`, borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 18, textDecoration: 'none', letterSpacing: 0.5 }}>
            🎾 Jetzt anmelden
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Was ist Pistol Pete */}
        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
            🤖 Was ist Pistol Pete?
          </div>
          <div style={{ padding: 20, fontSize: 15, lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 12px' }}>
              <strong>Pistol Pete</strong> ist unsere <strong>Lobster Elite Two</strong> — eine professionelle Ballmaschine, die dir Bälle in einstellbarer Geschwindigkeit, Höhe und mit Topspin oder Slice zuspielt.
            </p>
            <p style={{ margin: 0 }}>
              Perfekt für gezieltes Training, um Schlagtechnik und Konstanz zu verbessern — ohne Trainer, alleine oder auch in der Gruppe, ganz nach deinen Wünschen.
            </p>
          </div>
        </div>

        {/* So einfach geht's */}
        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
            ✅ So einfach geht's
          </div>
          <div style={{ padding: 20 }}>
            <Step num="1" title="Anmelden & Einweisung" desc="Füll das Formular aus, lies die Bedienungshinweise durch und akzeptiere die Nutzungsbedingungen. Einmalig — dann bist du dabei. Bei Bedarf steht unser Ballmaschinenwart auch gerne für eine Einweisung bereit." />
            <Step num="2" title="App öffnen & einchecken" desc="Öffne die Pistol Pete App, trag Datum und Dauer ein, und checke ein. Der Zahlencode für das Schloss erscheint automatisch." />
            <Step num="3" title="Loslegen" desc="Maschine auf den Platztransportieren und ausrichten, Bälle einfüllen, Training starten. Nach der Nutzung Maschine zurückstellen und Schloss sichern." />
          </div>
        </div>

        {/* Kosten */}
        <div style={{ background: BK, border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Die Kosten</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: Y, lineHeight: 1 }}>5 €</div>
            <div style={{ fontSize: 18, color: '#fff', marginTop: 4 }}>pro angefangene Stunde</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Transparent & digital abgerechnet über die App · Keine versteckten Kosten</div>
          </div>
        </div>

        {/* Anleitung */}
        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
            📖 Schnellanleitung
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
              Alles was du über die Bedienung der Ballmaschine wissen musst — kompakt auf zwei Seiten. Schau dir die Anleitung gerne schon vorab an.
            </p>
            <a
              href="/Schnellanleitung_Ballmaschine.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 20px', fontWeight: 900, fontSize: 15, textDecoration: 'none' }}
            >
              📄 Schnellanleitung herunterladen (PDF)
            </a>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 8, padding: '28px 20px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Bereit loszulegen?</div>
          <p style={{ margin: '0 0 20px', fontSize: 15, color: '#555' }}>
            Meld dich jetzt an — nach der Admin-Freigabe kannst du sofort starten.
          </p>
          <a href="/registrierung" style={{ display: 'inline-block', background: BK, color: Y, border: `2px solid ${BK}`, borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 18, textDecoration: 'none' }}>
            🎾 Jetzt anmelden
          </a>
          <p style={{ margin: '16px 0 0', fontSize: 13, color: '#888' }}>
            Fragen? <strong>Florian Haustein</strong> · WhatsApp: 01742418407
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
          <a href="/nutzungsbedingungen" style={{ color: '#888' }}>Nutzungsbedingungen</a>
          {' · '}
          <a href="/impressum" style={{ color: '#888' }}>Impressum & Datenschutz</a>
          {' · '}
          <a href="/login" style={{ color: '#888' }}>Login</a>
        </p>
      </div>
    </div>
  )
}

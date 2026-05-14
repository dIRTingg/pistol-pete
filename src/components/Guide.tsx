const Y  = '#FFE600'
const BK = '#111'

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1.5,
      fontSize: 16, fontWeight: 900, color: BK,
      borderBottom: `3px solid ${Y}`, paddingBottom: 6,
      margin: '20px 0 12px',
    }}>{children}</h3>
  )
}

function KeyBadge({ k }: { k: string }) {
  return (
    <span style={{
      background: BK, color: Y, fontWeight: 900, fontSize: 14,
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 4, fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace', flexShrink: 0,
    }}>{k}</span>
  )
}

function KeyInline({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', background: BK, color: Y, fontWeight: 900,
      fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace', fontSize: 11,
      padding: '1px 5px', borderRadius: 3, lineHeight: 1.3,
      verticalAlign: 'baseline', marginRight: 1,
    }}>{children}</span>
  )
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
}

export default function Guide() {
  const controls: [string, string][] = [
    ['A', 'Hauptschalter (An / Aus)'],
    ['B', 'Flugbahn justieren (oben / unten)'],
    ['C', 'Zufällige vertikale Streuung an/aus'],
    ['D', 'Zufällige horizontale Streuung an/aus'],
    ['F', 'Fernbedienung an / aus'],
    ['I', 'Ballschussintervall (12 – 2 Sek.)'],
    ['J', 'Ballgeschwindigkeit (10 – 80 mph)'],
    ['K', 'Spin (Unter- / Überdrill)'],
  ]

  return (
    <div style={{ padding: '0 18px 24px' }}>

      {/* Pete intro */}
      <div style={{
        background: Y, border: `2px solid ${BK}`, borderRadius: 10,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 14, position: 'relative', overflow: 'hidden',
        boxShadow: `3px 3px 0 ${BK}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)` }} />
        <img
          src="/icons/pete.png" alt="Pete"
          style={{ height: 80, position: 'relative', filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>
            Ballmaschine<br />„Pistol Pete"
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: BK, opacity: 0.75 }}>
            Lobster Elite Two
          </div>
        </div>
      </div>

      {/* PDF download */}
      <a
        href="/Schnellanleitung_Ballmaschine.pdf"
        download="Schnellanleitung_Ballmaschine.pdf"
        style={{
          background: BK, color: Y, borderRadius: 6, padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textDecoration: 'none', marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Y} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Schnellanleitung</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>PDF · 2 Seiten</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 900, color: Y, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `2px solid ${Y}`, paddingBottom: 1 }}>
          Laden →
        </span>
      </a>

      {/* Scan */}
      <div style={{ fontSize: 10, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
        Schnellanleitung
      </div>
      <img
        src="/schnellanleitung.jpg"
        alt="Schnellanleitung Pistol Pete"
        style={{ width: '100%', border: `2px solid ${BK}`, borderRadius: 6, display: 'block' }}
        onError={(e) => {
          const el = e.target as HTMLImageElement
          el.style.display = 'none'
          const div = document.createElement('div')
          div.style.cssText = `border: 2px dashed #ccc; border-radius: 6px; padding: 20px; text-align: center; color: #888; font-size: 14px;`
          div.innerHTML = 'Schnellanleitung-Bild nicht gefunden.<br>Bitte <code>public/schnellanleitung.jpg</code> ablegen.'
          el.parentNode?.insertBefore(div, el)
        }}
      />

      <H3>📍 Positionierung</H3>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#333', margin: 0 }}>
        <strong>Optimale Position:</strong> Mittelmarkierung der gegenüberliegenden Grundlinie (White Line Marker am Maschinenboden zur Ausrichtung verwenden). Für breitere oder geringere Streuung kann die Maschine auch weiter vor oder hinter der Grundlinie positioniert werden.
      </p>

      <H3>🎛 Bedienfeld</H3>
      <div style={{
        background: '#fff', border: `2px solid ${BK}`, borderRadius: 6, padding: 14,
        display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 8,
      }}>
        {controls.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <KeyBadge k={k} />
            <span style={{ fontSize: 13.5, alignSelf: 'center', color: '#222', lineHeight: 1.3 }}>{v}</span>
          </div>
        ))}
      </div>

      <H3>🚀 Inbetriebnahme</H3>
      <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          <>Maschine aufstellen (Grundlinie, Mittelmarkierung)</>,
          <>Hauptschalter <KeyInline>A</KeyInline> einschalten</>,
          <>Intervall <KeyInline>I</KeyInline> auf 6 – 10 Sekunden einstellen</>,
          <>3 – 4 Bälle einlegen, Richthöhe <KeyInline>B</KeyInline>, Geschwindigkeit <KeyInline>J</KeyInline>, Spin <KeyInline>K</KeyInline> und Streuung <KeyInline>C</KeyInline>/<KeyInline>D</KeyInline> einstellen</>,
          <>Ausschalten <KeyInline>A</KeyInline> und Ballkorb füllen <strong>(max. 150 Bälle)</strong></>,
          <>Einschalten <KeyInline>A</KeyInline> und auf die andere Seite gehen <em>(20 Sek. bis zum ersten Ball)</em></>,
        ].map((s, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              ...monoStyle, fontWeight: 900, fontSize: 13,
              color: BK, background: Y, padding: '3px 7px', borderRadius: 3,
              letterSpacing: -0.5, flexShrink: 0, lineHeight: 1.15, marginTop: 1,
            }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontSize: 13.5, color: '#222', lineHeight: 1.5 }}>{s}</span>
          </li>
        ))}
      </ol>

      <div style={{
        marginTop: 10, border: `2px solid #ff9f0a`, borderLeft: `5px solid #ff9f0a`,
        background: '#fff9e6', borderRadius: 4, padding: '10px 12px',
        fontSize: 13, color: '#222', display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ color: '#ff9f0a', fontWeight: 900 }}>⚠</span>
        <span><strong>Beim Einsammeln der Bälle:</strong> Zufuhr <KeyInline>I</KeyInline> nach links auf <strong>OFF</strong> drehen!</span>
      </div>

      <H3>🦺 Sicherheit</H3>
      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          <>Nutzung <strong>nur nach Einweisung</strong> (Mitglieder ab 12 J.)</>,
          <>Vorsichtig transportieren – auf Stufen / Unebenheiten achten</>,
          <><strong>Niemals in die laufende Maschine fassen!</strong> (Verletzungsgefahr)</>,
          <>Bei Regen / Nässe: <strong>Maschine nicht verwenden</strong>, keine feuchten Bälle</>,
          <>Nur vorgesehene <strong>drucklose Bälle</strong> verwenden – keine eigenen beimischen</>,
        ].map((t, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: BK, fontWeight: 900, marginTop: 1 }}>›</span>
            <span style={{ fontSize: 13.5, color: '#222', lineHeight: 1.45 }}>{t}</span>
          </li>
        ))}
      </ul>

      <div style={{
        marginTop: 18, background: Y, border: `2px solid ${BK}`, borderRadius: 6,
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: `3px 3px 0 ${BK}`,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Nutzungskosten</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>angefangene Stunde</div>
        </div>
        <div style={{ ...monoStyle, fontSize: 32, fontWeight: 900, color: BK, letterSpacing: -1 }}>5 €</div>
      </div>
    </div>
  )
}

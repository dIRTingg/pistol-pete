'use client'
// src/components/Guide.tsx
// Lege die Schnellanleitung als /public/schnellanleitung.jpg ab (aus PDF konvertiert)

const Y = '#FFE600'; const BK = '#111'
const H = (t: string) => (
  <h3 style={{ fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1, fontSize: 16, borderBottom: `3px solid ${Y}`, paddingBottom: 6, marginTop: 20, marginBottom: 12 }}>{t}</h3>
)

export default function Guide() {
  return (
    <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        📖 Schnellanleitung — Pistol Pete
      </div>
      <div style={{ padding: 20 }}>

        {/* Pete + Intro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: Y, border: `2px solid ${BK}`, borderRadius: 8, padding: '12px 16px' }}>
          <img src="/icons/pete.png" alt="Pete" style={{ height: 80, width: 'auto', flexShrink: 0, filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.15))' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, textTransform: 'uppercase' }}>Ballmaschine „Pistol Pete"</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Lobster Elite Two · TV Häslach e.V. Tennis · V1.1</div>
          </div>
        </div>

        {/* Embedded Schnellanleitung scan */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            📄 Original Schnellanleitung (Scan)
          </div>
          <img
            src="/schnellanleitung.jpg"
            alt="Schnellanleitung Ballmaschine Pistol Pete"
            style={{ width: '100%', border: `2px solid ${BK}`, borderRadius: 6, display: 'block' }}
            onError={(e) => {
              // Fallback wenn Bild nicht vorhanden
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              const div = document.createElement('div')
              div.style.cssText = `border: 2px dashed #ccc; border-radius: 6px; padding: 20px; text-align: center; color: #888; font-size: 14px;`
              div.innerHTML = '📄 Schnellanleitung-Bild nicht gefunden.<br>Bitte <code>public/schnellanleitung.jpg</code> ablegen.'
              el.parentNode?.insertBefore(div, el)
            }}
          />
        </div>

        {H('📍 Positionierung')}
        <p style={{ lineHeight: 1.7, marginTop: 0 }}>
          <strong>Optimale Position:</strong> Mittelmarkierung der gegenüberliegenden Grundlinie (White Line Marker am Maschinenboden zur Ausrichtung verwenden).
          Für breitere oder geringere Streuung kann die Maschine auch weiter vor oder hinter der Grundlinie positioniert werden.
        </p>

        {H('🎛️ Bedienfeld')}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 14px', background: '#f8f8f8', border: `2px solid ${BK}`, borderRadius: 6, padding: 14, marginBottom: 8 }}>
          {[['A','Hauptschalter (An/Aus)'],['B','Flugbahn justieren (oben/unten)'],['C','Zufällige vertikale Streuung an/aus'],['D','Zufällige horizontale Streuung an/aus'],['F','Fernbedienung an/aus'],['I','Ballschussintervall (12–2 Sek.)'],['J','Ballgeschwindigkeit (10–80 mph)'],['K','Spin (Unter-/Überdrill)']].flatMap(([k, v]) => [
            <span key={k+'k'} style={{ background: BK, color: Y, fontWeight: 900, fontSize: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>{k}</span>,
            <span key={k+'v'} style={{ fontSize: 14, alignSelf: 'center' }}>{v}</span>
          ])}
        </div>

        {H('🚀 Inbetriebnahme')}
        <ol style={{ paddingLeft: 20, lineHeight: 2.2, fontSize: 14, margin: '0 0 12px' }}>
          <li>Maschine aufstellen (Grundlinie, Mittelmarkierung)</li>
          <li>Hauptschalter <strong>(A)</strong> einschalten</li>
          <li>Intervall <strong>(I)</strong> auf 6–10 Sekunden einstellen</li>
          <li>3–4 Bälle einlegen, Richthöhe (B), Geschwindigkeit (J), Spin (K) und Streuung (C/D) einstellen</li>
          <li>Ausschalten (A) und Ballkorb füllen <strong>(max. 150 Bälle)</strong></li>
          <li>Einschalten (A) und auf die andere Seite gehen <em>(20 Sek. bis zum ersten Ball)</em></li>
        </ol>
        <div style={{ border: '2px solid #ff9f0a', borderLeft: '5px solid #ff9f0a', background: '#fff9e6', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>
          ⚠️ <strong>Beim Einsammeln der Bälle: Zufuhr (I) nach links auf OFF drehen!</strong>
        </div>

        {H('🦺 Sicherheit')}
        <ul style={{ lineHeight: 2.1, fontSize: 14, paddingLeft: 20, margin: '0 0 16px' }}>
          <li>Nutzung <strong>nur nach Einweisung</strong> (Mitglieder ab 12 J.)</li>
          <li>Vorsichtig transportieren – auf Stufen/Unebenheiten achten</li>
          <li><strong>Niemals in die laufende Maschine fassen!</strong> (Verletzungsgefahr)</li>
          <li>Bei Regen/Nässe: <strong>Maschine nicht verwenden</strong>, keine feuchten Bälle</li>
          <li>Nur vorgesehene <strong>drucklose Bälle</strong> verwenden – keine eigenen beimischen</li>
        </ul>

        <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>💰 Nutzungskosten</strong>
          <strong style={{ fontSize: 20 }}>5 € / angefangene Stunde</strong>
        </div>
      </div>
    </div>
  )
}
